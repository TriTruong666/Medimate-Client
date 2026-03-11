import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFetch } from "../useFetch";
import * as UserService from "@/apis/user.service";

export function useUserList() {
  return useFetch(["users"], async() => UserService.getUsers());
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: UserService.createDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  })
}