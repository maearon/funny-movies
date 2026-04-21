"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import accountActivationApi from "@/components/shared/api/accountActivationApi";
import flashMessage from "@/components/shared/flashMessages";

// Kiểu dữ liệu cho params
interface EditProps {
  params: Promise<{
    slug: string[]; // slug is string array
  }>;
}

export default function Edit(props: EditProps) {
  const params = use(props.params);
  const router = useRouter();

  // Decode slug to activation_token and email
  const activation_token = params.slug?.[0] || "";
  const email = params.slug?.[1] ? decodeURIComponent(params.slug[1]) : "";

  useEffect(() => {
    if (!activation_token || !email) {
      // If missing token or email -> display error and redirect
      flashMessage("error", "Invalid activation link");
      router.push("/");
      return;
    }

    // Call API to activate account
    accountActivationApi
      .update(activation_token, email)
      .then((response) => {
        flashMessage("success", "The account has been activated. Please log in.");
        // setTimeout(() => {
        //   router.push("/login");
        // }, 3000);
      })
      .catch((error) => {
        console.error("Activation Error:", error);
        flashMessage("error", "Account activation failed. Please try again.");
        // router.push("/");
      });
  }, [activation_token, email, router]);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>Activating your account...</h1>
      <p>Please wait while we process your activation.</p>
    </div>
  );
}
