import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import UpdatePassForm from "../../components/auth/UpdatePassForm";

export default function UpdatePass() {
  return (
    <>
      <PageMeta
        title="Recuperar"
        description="Recuperacion"
      />
      <AuthLayout>
        <UpdatePassForm/>
      </AuthLayout>
    </>
  );
}
