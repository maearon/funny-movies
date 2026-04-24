"use client";
import Image from 'next/image'
import { ErrorMessage, Field, FieldArray, Form, Formik } from 'formik'
import { useRouter } from 'next/navigation'
import React, {  useCallback, useEffect, useRef, useState, use } from 'react';
import * as Yup from 'yup'
import userApi, { UserEdit } from '../../../../components/shared/api/userApi'
import errorMessage from '../../../../components/shared/errorMessages'
import flashMessage from '../../../../components/shared/flashMessages'
// import TextError from '../../../../components/shared/TextError'

const initialValues = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  errors: [] as string[],
  phNumbers: ['']
}

const savedValues = {
  name: 'Example User',
  email: 'example@railstutorial.org',
  password: 'foobar',
  password_confirmation: 'foobar',
  errors: [] as string[],
  phNumbers: ['+84912915132','+84904272299']
}

interface FormValues {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

const defaultValues: FormValues = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
};

const Edit = (props: {params: Promise<{id: string}>}) => {
  const params = use(props.params);
  const router = useRouter();
  const id = params.id;
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState({} as UserEdit)
  const [gravatar, setGravatar] = useState('')


  const [initialValues, setInitialValues] =
    useState<FormValues>(defaultValues);

  // 🔥 fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userApi.edit(id);

        if (res.user) {
          setInitialValues({
            name: res.user.name || "",
            email: res.user.email || "",
            password: "",
            password_confirmation: "",
          });
          setUser(res.user);
          setGravatar(res.gravatar);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false); // 🔥 QUAN TRỌNG
      }
    };

    fetchUser();
  }, [id]);

  const validationSchema = Yup.object({
    name: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
  });

  const onSubmit = async (
    values: FormValues,
    { setSubmitting }: any
  ) => {
    try {
      await userApi.update(id, { user: values });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
    <h1>Update your profile</h1>
    <div className="row">
      <div className="col-md-6 col-md-offset-3">
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {(formik) => (
            <Form>
              <label>Name</label>
              <Field name="name" className="form-control" />

              <label>Email</label>
              <Field name="email" type="email" className="form-control" />

              <label>Password</label>
              <Field
                name="password"
                type="password"
                className="form-control"
              />

              <label>Confirmation</label>
              <Field
                name="password_confirmation"
                type="password"
                className="form-control"
              />

              <button
                type="submit"
                className="btn btn-primary"
                disabled={!formik.isValid || formik.isSubmitting}
              >
                {formik.isSubmitting ? "Saving..." : "Save changes"}
              </button>
            </Form>
          )}
        </Formik>
        <div className="gravatar_edit">
          <Image
            className={"gravatar"}
            src={gravatar}
            alt={user.name} 
            width={80}
            height={80}
            priority
          />
          <a href="https://gravatar.com/emails" target="_blank" rel="noopener noreferrer">change</a>
        </div>
      </div>
    </div>
    </>
  )
}

export default Edit
