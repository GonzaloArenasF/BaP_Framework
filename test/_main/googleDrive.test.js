import { describe, it, expect, vi, beforeEach } from "vitest";
import { ensureFolder, listFiles, readFileContent, createFile, updateFile } from "../../src/_main/googleDrive.js";

describe("Google Drive Core Module Unit Tests", () => {
  const mockToken = "mock-oauth-access-token";

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe("ensureFolder", () => {
    it("should throw error if accessToken or folderName are missing", async () => {
      await expect(ensureFolder(null, "TestFolder")).rejects.toThrow("Token de acceso OAuth no proporcionado.");
      await expect(ensureFolder(mockToken, null)).rejects.toThrow("Nombre de carpeta no especificado.");
    });

    it("should return existing folder id when found", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ files: [{ id: "existing-folder-123", name: "BaP Framework Documents" }] })
      });

      const folderId = await ensureFolder(mockToken, "BaP Framework Documents");
      expect(folderId).toBe("existing-folder-123");
    });

    it("should create new folder when not found", async () => {
      // 1st call: query folder returns empty list
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ files: [] })
      });

      // 2nd call: create folder returns new folder id
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "new-folder-456", name: "BaP Framework Documents" })
      });

      const folderId = await ensureFolder(mockToken, "BaP Framework Documents");
      expect(folderId).toBe("new-folder-456");
    });

    it("should throw error on query or create HTTP failure", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        text: async () => "Query Failed Error"
      });
      await expect(ensureFolder(mockToken, "BaP Framework Documents")).rejects.toThrow("Error al consultar carpeta en Drive: Query Failed Error");

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ files: [] })
      });
      global.fetch.mockResolvedValueOnce({
        ok: false,
        text: async () => "Create Failed Error"
      });
      await expect(ensureFolder(mockToken, "BaP Framework Documents")).rejects.toThrow("Error al crear carpeta en Drive: Create Failed Error");
    });
  });

  describe("listFiles", () => {
    it("should return empty array if arguments missing", async () => {
      const res = await listFiles(null, "folder-123");
      expect(res).toEqual([]);
    });

    it("should list files inside folder", async () => {
      const mockFiles = [{ id: "file-1", name: "document.txt" }];
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ files: mockFiles })
      });

      const res = await listFiles(mockToken, "folder-123");
      expect(res).toEqual(mockFiles);
    });

    it("should throw error on HTTP list failure", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        text: async () => "List Error"
      });
      await expect(listFiles(mockToken, "folder-123")).rejects.toThrow("Error al listar archivos en Drive: List Error");
    });
  });

  describe("readFileContent", () => {
    it("should fetch text content of specified file", async () => {
      const textContent = "Sample content";
      global.fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => textContent
      });

      const res = await readFileContent(mockToken, "file-123");
      expect(res).toBe(textContent);
    });

    it("should throw error when missing params or HTTP failure", async () => {
      await expect(readFileContent(null, null)).rejects.toThrow("Parámetros de lectura incompletos.");

      global.fetch.mockResolvedValueOnce({
        ok: false,
        text: async () => "Read Error"
      });
      await expect(readFileContent(mockToken, "file-123")).rejects.toThrow("Error al leer archivo de Drive: Read Error");
    });
  });

  describe("createFile & updateFile", () => {
    it("should create a new file with multipart body", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "created-file-789", name: "document.txt" })
      });

      const res = await createFile(mockToken, {
        name: "document.txt",
        content: "hello world",
        folderId: "folder-123"
      });

      expect(res.id).toBe("created-file-789");
    });

    it("should throw error when createFile missing params or HTTP failure", async () => {
      await expect(createFile(null, {})).rejects.toThrow("Parámetros de creación de archivo incompletos.");

      global.fetch.mockResolvedValueOnce({
        ok: false,
        text: async () => "Create File Error"
      });
      await expect(createFile(mockToken, { name: "test", folderId: "123", content: "hello" })).rejects.toThrow("Error al crear archivo en Drive: Create File Error");
    });

    it("should update an existing file with media patch", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "file-789", name: "document.txt" })
      });

      const res = await updateFile(mockToken, {
        fileId: "file-789",
        content: "updated content"
      });

      expect(res.id).toBe("file-789");
    });

    it("should throw error when updateFile missing params or HTTP failure", async () => {
      await expect(updateFile(null, {})).rejects.toThrow("Parámetros de actualización de archivo incompletos.");

      global.fetch.mockResolvedValueOnce({
        ok: false,
        text: async () => "Update File Error"
      });
      await expect(updateFile(mockToken, { fileId: "123", content: "hello" })).rejects.toThrow("Error al actualizar archivo en Drive: Update File Error");
    });
  });
});
