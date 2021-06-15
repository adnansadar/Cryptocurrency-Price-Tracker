import { React, useState } from "react";
import emailjs from "emailjs-com";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Toast, Button } from "react-bootstrap";

import Nav from "./Nav";
import Footer from "./Footer";
import "./App.css";
import "./Contact.css";

import { useTheme } from "../context/ThemeProvider";

const style1 = {
  width: "60%",
  margin: "2em auto",
  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
  padding: "1em 2em",
};

const style2 = {
  paddingTop: "1em",
};

function sendEmail(e) {
  e.preventDefault();
  // YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', e.target, 'YOUR_USER_ID'
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
  const { darkMode, toggleTheme } = useTheme();
  const [show, setShow] = useState(false);
  return (
    <Formik
      // default values set for the input fields
      initialValues={{ name: "", email: "", subject: "", message: "" }}
      // after submitting the form we are directed here
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          setSubmitting(false);
        }, 1000);
      }}
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
          <Nav onClick={toggleTheme} />
          <Form style={style1} onSubmit={sendEmail}>
            <h1 style={style2}>Get In Touch</h1>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <Field
                name="name"
                // use styling on the field to display error
                className={
                  formik.touched.name && formik.errors.name
                    ? "form-control is-invalid "
                    : "form-control "
                }
                type="text"
              />
              {/* if input field is clicked on and no input is given then return error using formik */}
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
            {/* Handling Toast */}
            <div
              style={{
                position: "relative",
                minHeight: "120px",
              }}
            >
              {/* display in top right */}
              <Toast
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                }}
                // toast will close automatically after 3 sec
                onClose={() => setShow(false)}
                show={show}
                delay={3000}
                autohide
              >
                <Toast.Header>
                  <img
                    src="holder.js/20x20?text=%20"
                    className="rounded mr-2"
                    alt=""
                  />
                  <strong className="mr-auto text-success">
                    Submit Successful
                  </strong>
                  {/* <small>Just Now</small> */}
                </Toast.Header>
                <Toast.Body className="mr-auto text-dark ">
                  Your message was sent successfully!
                </Toast.Body>
              </Toast>

              <div className="form-group">
                <Button
                  // show toast on click
                  onClick={() => setShow(true)}
                  type="submit"
                  variant="outline-warning"
                  className="ml-0"
                  // while the button is already clicked for submitting, the user wont be able to spam the submit button
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Please wait..." : "Submit"}
                </Button>
              </div>
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
