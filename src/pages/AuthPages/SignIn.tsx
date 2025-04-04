import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Inicia sesion"
        description="Bienvenido a la Unidad Economica Especializada de Aprovechamiento Forestal "
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
