"use client";

import { NextPage } from "next";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import flashMessage from "../../components/shared/flashMessages";
import ShowErrors, { ErrorMessageType } from "@/components/shared/errorMessages";
import Link from "next/link";
import * as Yup from "yup";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { handleApiError } from "@/components/shared/handleApiError";
import { useSignupMutation } from "@/components/shared/api/hooks/useSignupMutation";

const SignupSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Password confirmation is required"),
});

interface FormValues {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

const initialValues: FormValues = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
};

const New: NextPage = () => {
  const router = useRouter();
  const myRef = useRef<HTMLInputElement>(null);
  const signupMutation = useSignupMutation();
  const [errors, setErrors] = useState<ErrorMessageType>({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const handleSubmit = async (values: FormValues) => {
    setErrors({});

    const payload = {
      user: {
        name: values.name,
        email: values.email,
        password: values.password,
        password_confirmation: values.password_confirmation,
      },
    };

    signupMutation.mutate(payload, {
      onSuccess: (response: any) => {
        if (response.success) {
          flashMessage("success", response.message || "Signup successful.");
          router.push("/account-login");
        } else if (response.errors) {
          setErrors(response.errors);
        }
      },
      onError: (error: any) => {
        if (error.code === "ERR_NETWORK") {
          flashMessage("error", "Cannot connect to the server. Please try again later.");
          return;
        }

        const res = error.response?.data;
        if (Array.isArray(res?.errors)) {
          const fieldErrors: ErrorMessageType = {};
          res.errors.forEach((err: any) => {
            const field = err?.cause?.field || "general";
            const message = err.defaultMessage || "Invalid input";
            if (!fieldErrors[field]) fieldErrors[field] = [];
            fieldErrors[field].push(message);
          });
          setErrors(fieldErrors);
        } else if (res?.message) {
          setErrors({ general: [res.message] });
        } else {
          setErrors(handleApiError(error));
          flashMessage("error", "Something went wrong during signup.");
        }
      },
    });
  };

  return (
    <>
      <h1>Sign up</h1>

      <div className="row">
        <div className="col-md-6 col-md-offset-3">
          <Formik
            initialValues={initialValues}
            validationSchema={SignupSchema}
            onSubmit={handleSubmit}
          >
            <Form className="new_user" id="new_user">
              {Object.keys(errors).length !== 0 && <ShowErrors errorMessage={errors} />}

              <label htmlFor="user_name">Name</label>
              <Field
                className="form-control"
                type="text"
                name="name"
                id="user_name"
                autoComplete="off"
              />
              <ErrorMessage name="name">
                {(msg) => <div className="error" style={{ color: "red" }}>{msg}</div>}
              </ErrorMessage>

              <label htmlFor="user_email">Email</label>
              <Field
                className="form-control"
                type="email"
                name="email"
                id="user_email"
              />
              <ErrorMessage name="email">
                {(msg) => <div className="error" style={{ color: "red" }}>{msg}</div>}
              </ErrorMessage>

              <label htmlFor="user_password">Password</label>
              <Field
                className="form-control"
                type="password"
                name="password"
                id="user_password"
              />
              <ErrorMessage name="password">
                {(msg) => <div className="error" style={{ color: "red" }}>{msg}</div>}
              </ErrorMessage>

              <label htmlFor="user_password_confirmation">Confirmation</label>
              <Field
                className="form-control"
                type="password"
                name="password_confirmation"
                id="user_password_confirmation"
              />
              <ErrorMessage name="password_confirmation">
                {(msg) => <div className="error" style={{ color: "red" }}>{msg}</div>}
              </ErrorMessage>

              <input
                ref={myRef}
                type="submit"
                name="commit"
                value="Create my account"
                className="btn btn-primary"
                data-disable-with="Create my account"
              />
              <Link href="/account_activations/new">(resend activation email)</Link>
            </Form>
          </Formik>
        </div>
      </div>
    </>
  );
};

export default New;
