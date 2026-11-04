import { createServerFn } from "@tanstack/react-start";
import { consultantInputSchema, type ConsultantResult } from "./consultant-schema";

export const askConsultant = createServerFn({ method: "POST" })
  .validator((input: unknown) => consultantInputSchema.parse(input))
  .handler(async ({ data }): Promise<ConsultantResult> => {
    const { answerConsultant } = await import("./consultant.server");
    return answerConsultant(data);
  });
