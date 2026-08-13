export class GoogleGenerativeAI {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  getGenerativeModel(config) {
    return {
      generateContent: async (prompt) => {
        return {
          response: {
            text: () => "Mocked response from GoogleGenerativeAI"
          }
        };
      }
    };
  }
}
