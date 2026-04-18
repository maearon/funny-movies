"use client";
import { useMutation } from "@tanstack/react-query";
import { UserCreateParams } from "@/types/user";
import userApi from "../userApi";

export const useSignupMutation = () => {
  return useMutation({
    mutationKey: ['Signup'],
    mutationFn: async (data: UserCreateParams) => userApi.create(data),
  });
};
