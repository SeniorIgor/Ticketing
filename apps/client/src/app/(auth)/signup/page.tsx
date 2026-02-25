import { SignupForm } from './SignupForm';

export default function SignupPage() {
  return (
    <div className="container d-flex align-items-center justify-content-center">
      <div style={{ width: 480 }}>
        <h1 className="mb-4 text-center">Create an account</h1>
        <SignupForm />
      </div>
    </div>
  );
}
