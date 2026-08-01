/**
 * SERVICIO CORE GOOGLE DRIVE (BAP FRAMEWORK v2.4.0)
 *
 * Módulo reutilizable y desacoplado para la interacción con Google Drive API v3.
 * Proporciona métodos genéricos para gestión de carpetas y lectura/escritura de archivos.
 *
 * ⚠️ REQUISITO PREVIO MANDATORIO EN GOOGLE CLOUD CONSOLE:
 * Para que este servicio funcione, la "Google Drive API" debe estar explícitamente HABILITADA
 * en el proyecto de Google Cloud / Firebase. De lo contrario, se obtendrá un error 403 (PERMISSION_DENIED).
 * Enlace directo de activación:
 * https://console.developers.google.com/apis/api/drive.googleapis.com/overview
 *
 * OPINIONES Y SCOPES OAUTH 2.0 DE GOOGLE DRIVE (Configurables en bap.config.json -> features.googleDrive.scopes):
 *
 * 1. Acceso acotado a archivos de la aplicación (Recomendado por seguridad y privacidad):
 *    - "https://www.googleapis.com/auth/drive.file"
 *      (Permite crear archivos nuevos y acceder únicamente a los creados o abiertos por esta app)
 *
 * 2. Scopes alternativos según requerimientos del proyecto:
 *    - "https://www.googleapis.com/auth/drive.readonly"
 *      (Solo lectura: consultar y descargar archivos existentes en el Drive del usuario)
 *    - "https://www.googleapis.com/auth/drive.appdata"
 *      (Carpeta de datos de aplicación: almacena datos en una carpeta privada e invisible para el usuario)
 *    - "https://www.googleapis.com/auth/drive"
 *      (Acceso completo a todo el Google Drive del usuario - Usar con precaución)
 */

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

/**
 * Busca una carpeta por nombre en el directorio raíz de Google Drive.
 * Si no existe, la crea de forma automática.
 * 
 * @param {string} accessToken - Token de acceso OAuth 2.0 de Google.
 * @param {string} folderName - Nombre de la carpeta a buscar o crear.
 * @returns {Promise<string>} Promesa que resuelve al ID de la carpeta en Google Drive.
 */
export async function ensureFolder(accessToken, folderName) {
  if (!accessToken) throw new Error('Token de acceso OAuth no proporcionado.');
  if (!folderName) throw new Error('Nombre de carpeta no especificado.');

  const query = encodeURIComponent(`name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const response = await fetch(`${DRIVE_API_BASE}/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al consultar carpeta en Drive: ${errorText}`);
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  // Crear carpeta si no existe
  const createResponse = await fetch(`${DRIVE_API_BASE}/files`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`Error al crear carpeta en Drive: ${errorText}`);
  }

  const folderData = await createResponse.json();
  return folderData.id;
}

/**
 * Lista los archivos almacenados dentro de una carpeta específica de Google Drive.
 * 
 * @param {string} accessToken - Token de acceso OAuth 2.0.
 * @param {string} folderId - ID de la carpeta contenedora.
 * @returns {Promise<Array<{id: string, name: string, mimeType: string, modifiedTime: string}>>} Lista de archivos.
 */
export async function listFiles(accessToken, folderId) {
  if (!accessToken || !folderId) return [];

  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const response = await fetch(`${DRIVE_API_BASE}/files?q=${query}&fields=files(id,name,mimeType,modifiedTime)&orderBy=modifiedTime desc`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al listar archivos en Drive: ${errorText}`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Descarga y retorna el contenido en texto plano de un archivo de Google Drive.
 * 
 * @param {string} accessToken - Token de acceso OAuth 2.0.
 * @param {string} fileId - ID del archivo en Google Drive.
 * @returns {Promise<string>} Contenido del archivo.
 */
export async function readFileContent(accessToken, fileId) {
  if (!accessToken || !fileId) throw new Error('Parámetros de lectura incompletos.');

  const response = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al leer archivo de Drive: ${errorText}`);
  }

  return await response.text();
}

/**
 * Crea un nuevo archivo en Google Drive dentro de la carpeta especificada.
 * 
 * @param {string} accessToken - Token de acceso OAuth 2.0.
 * @param {Object} options
 * @param {string} options.name - Nombre del archivo.
 * @param {string} options.content - Contenido de texto del archivo.
 * @param {string} options.folderId - ID de la carpeta donde se guardará.
 * @param {string} [options.mimeType='text/xml'] - Tipo MIME del contenido.
 * @returns {Promise<{id: string, name: string}>} Metadatos del archivo creado.
 */
export async function createFile(accessToken, { name, content, folderId, mimeType = 'text/xml' }) {
  if (!accessToken || !name || !folderId) throw new Error('Parámetros de creación de archivo incompletos.');

  const metadata = {
    name,
    parents: [folderId],
    mimeType
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const response = await fetch(`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary="${boundary}"`
    },
    body: multipartRequestBody
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al crear archivo en Drive: ${errorText}`);
  }

  return await response.json();
}

/**
 * Actualiza el contenido de un archivo existente en Google Drive.
 * 
 * @param {string} accessToken - Token de acceso OAuth 2.0.
 * @param {Object} options
 * @param {string} options.fileId - ID del archivo a actualizar.
 * @param {string} options.content - Nuevo contenido del archivo.
 * @param {string} [options.mimeType='text/xml'] - Tipo MIME del contenido.
 * @returns {Promise<{id: string, name: string}>} Metadatos del archivo actualizado.
 */
export async function updateFile(accessToken, { fileId, content, mimeType = 'text/xml' }) {
  if (!accessToken || !fileId) throw new Error('Parámetros de actualización de archivo incompletos.');

  const response = await fetch(`${DRIVE_UPLOAD_BASE}/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': mimeType
    },
    body: content
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al actualizar archivo en Drive: ${errorText}`);
  }

  return await response.json();
}
