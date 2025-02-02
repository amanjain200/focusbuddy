import axios from "axios"
export const handleAiInsights = async ({data} : any) => {
  try {
    const response = await axios.post('http://localhost:3000/groq', data);
    return response.data;
  }catch {
    console.log('Error in fetching data');
    return null;
  }
}