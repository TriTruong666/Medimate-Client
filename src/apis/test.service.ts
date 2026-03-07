import { axiosNETClient } from "./client";

export async function demoService() {
  const res = await axiosNETClient.get(`/api/v1/users`);
  return res.data.data;
}
