export const tools = [
  {
    name: "navigate",
    description: "Navigate to a section of the portfolio",
    parameters: {
      type: "object",
      properties: {
        section: {
          type: "string",
          enum: ["projects", "about", "skills", "contact"]
        }
      },
      required: ["section"]
    }
  }
];