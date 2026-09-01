import { redirect } from "next/navigation";

/** Paycheck withholding is now the "Paycheck Withholding" tab on the home page — kept as a redirect so existing bookmarks/links still work. */
export default function PaycheckWithholdingRedirect() {
  redirect("/?tab=paycheck");
}
