import api from "./axios_instance";


export const postRequest = async (endpoint: string, data: any) => {
  const res = await api.post(endpoint, data);
  return res.data;
}


export const getRequest = async (endpoint: string) => {
  const res = await api.get(endpoint);
  return res.data;
}


export const putRequest = async (endpoint: string, updated_data: any) => {
  const res = await api.put(endpoint, updated_data);
  return res.data;
}


export const uploadFileRequest = async (endpoint: string, formData: FormData) => {
  const res = await api.put(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};


export const deleteRequest = async (endpoint: string) => {
  const res = await api.delete(endpoint)
  return res.data;
}
