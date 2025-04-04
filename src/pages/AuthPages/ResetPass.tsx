import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import ResetPassForm from "../../components/auth/ResetPassForm";

export default function ResetPass() {
  return (
    <>
      <PageMeta
        title="Recuperar"
        description="Recuperacion"
      />
      <AuthLayout>
        <ResetPassForm/>
      </AuthLayout>
    </>
  );
}
