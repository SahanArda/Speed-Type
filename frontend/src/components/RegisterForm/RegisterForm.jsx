import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import axios from "axios";
import auth from "../../services/auth";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const validationSchema = Yup.object().shape({
    username: Yup.string().required("Username is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    passwordConfirmation: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const handleSubmit = async (values) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/register",
        values
      );
      const { access_token, user } = response.data;

      auth.setToken(access_token);
      auth.setUser(user);

      navigate("/");
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message); // Set specific error message from the backend
      } else {
        setError("Registration failed, please try again.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-navy">
      <div className="w-full max-w-md p-8 space-y-6 bg-light-navy rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-lightest-slate">
          Register
        </h2>

        {error && <div className="text-red-500 text-center">{error}</div>}

        <Formik
          initialValues={{
            username: "",
            email: "",
            password: "",
            passwordConfirmation: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="block text-lightest-slate">Username</label>
                <Field
                  type="text"
                  name="username"
                  className="w-full p-2 mt-1 border rounded-md border-slate focus:ring-green focus:border-green bg-light-navy text-light-slate"
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-lightest-slate">Email</label>
                <Field
                  type="email"
                  name="email"
                  className="w-full p-2 mt-1 border rounded-md border-slate focus:ring-green focus:border-green bg-light-navy text-light-slate"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-lightest-slate">Password</label>
                <Field
                  type="password"
                  name="password"
                  className="w-full p-2 mt-1 border rounded-md border-slate focus:ring-green focus:border-green bg-light-navy text-light-slate"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-lightest-slate">Confirm Password</label>
                <Field
                  type="password"
                  name="passwordConfirmation"
                  className="w-full p-2 mt-1 border rounded-md border-slate focus:ring-green focus:border-green bg-light-navy text-light-slate"
                />
                <ErrorMessage
                  name="passwordConfirmation"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 font-bold text-navy bg-green rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-green"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Account..." : "Register"}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        <div className="text-center">
          <Link to="/" className="text-green hover:underline">
            Already have an account? Login here.
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
