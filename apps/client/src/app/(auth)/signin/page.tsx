import { SigninForm } from './SigninForm';

export default function SigninPage() {
  return (
    <div className="container d-flex align-items-center justify-content-center">
      <div style={{ width: 480 }}>
        <h1 className="mb-4 text-center">Sign in</h1>
        <SigninForm />
      </div>
    </div>
  );
}
