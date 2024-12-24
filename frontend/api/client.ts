const BASE_URL = "http://localhost:8080/api";

async function handleResponse(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

export const client = {
  get: async (endpoint: string) => {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    return handleResponse(response);
  },

  post: async (endpoint: string, body: any) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },
};
