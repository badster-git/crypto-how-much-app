import type { NextPage } from "next";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { FormValidator } from "utils";

export const InputForm: NextPage = () => {
  return (
    <Formik
      initialValues={{ amount: 0, date: new Date(Date.now()) }}
      validate={(values) => FormValidator(values)}
      onSubmit={(values, { setSubmitting }) => {
        console.log(values);
        setTimeout(() => {
          setSubmitting(false);
        }, 200);
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <Field type="currency" name="amount" />
          <ErrorMessage name="amount" component="div" />
          <Field type="date" name="date" />
          <ErrorMessage name="date" component="div" />
          <button
            className="outline w-24 rounded-sm"
            type="submit"
            disabled={isSubmitting}
          >
            Check
          </button>
        </Form>
      )}
    </Formik>
  );
};
