import { React, useState } from "react";
import emailjs from "emailjs-com";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

import Nav from "./Nav";
import Footer from "./Footer";
import "./App.css";
import "./Contact.css";

const style1 = {
  width: "60%",
  margin: "auto",
};

const style2 = {
  paddingTop: "2em",
};

function sendEmail(e) {
  e.preventDefault();

  emailjs
    .sendForm(
      "service_tepamqu",
      "template_nk1zwxb",
      e.target,
      "user_PLloXOyEK7ZMqr1zhif58"
    )
    .then(
      (result) => {
        console.log(result.text);
      },
      (error) => {
        console.log(error.text);
      }
    );
  e.target.reset();
}

const Contact = () => {
  const [darkMode, setDarkMode] = useState(true);
  return (
    <Formik
      // default values set for the input fields
      initialValues={{ name: "", email: "", subject: "", message: "" }}
      // after submitting the form we are directed here
      // onSubmit={(values, { setSubmitting }) => {
      //   setTimeout(() => {
      //     alert(JSON.stringify(values, null, 2));
      //     setSubmitting(false);
      //   }, 1000);
      // }}
      validationSchema={Yup.object({
        name: Yup.string()
          .max(15, "Must be 15 characters or less")
          .required("Name is required"),
        subject: Yup.string().required("Subject is required"),
        email: Yup.string()
          .email("Invalid email address")
          .required("Email is required"),
      })}
    >
      {/* accessing formik properties */}
      {(formik, isSubmitting) => (
        <div className={darkMode ? " header-darkMode" : "header-lightMode"}>
          <Nav
            onClick={() => {
              setDarkMode(!darkMode);
            }}
          />
          <Form style={style1} onSubmit={sendEmail}>
            <h1 style={style2}>Get In Touch</h1>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <Field
                name="name"
                className={
                  formik.touched.name && formik.errors.name
                    ? "form-control is-invalid "
                    : "form-control "
                }
                type="text"
              />
              {formik.touched.name && formik.errors.name ? (
                <div className="invalid-feedback">{formik.errors.name}</div>
              ) : null}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <Field
                name="email"
                className={
                  formik.touched.email && formik.errors.email
                    ? "form-control is-invalid "
                    : "form-control "
                }
                type="email"
              />
              {formik.touched.email && formik.errors.email ? (
                <div className="invalid-feedback">{formik.errors.email}</div>
              ) : null}
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <Field
                name="subject"
                className={
                  formik.touched.subject && formik.errors.subject
                    ? "form-control is-invalid "
                    : "form-control "
                }
                type="text"
              />
              {formik.touched.subject && formik.errors.subject ? (
                <div className="invalid-feedback">{formik.errors.subject}</div>
              ) : null}
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <Field
                name="message"
                className="form-control "
                as="textarea"
                rows={3}
                cols={10}
              />
            </div>

            <div className="form-group">
              <button
                type="submit"
                className="btn btn-outline-warning"
                // while the button is already clicked for submitting, the user wont be able to spam the submit button
                disabled={isSubmitting}
              >
                {isSubmitting ? "Please wait..." : "Submit"}
              </button>
            </div>
          </Form>
          <div>
            <Footer />
          </div>
        </div>
      )}
    </Formik>
  );
};

export default Contact;
