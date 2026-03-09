import { useFetch } from "../useFetch";
import * as UserService from "@/apis/user.service";

export function useUserList() {
  return useFetch(["users"], async() => UserService.getUsers());
}