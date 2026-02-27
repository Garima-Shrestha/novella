import { Request, Response } from "express";
import z from "zod";

import { InitiateKhaltiPaymentDto, LookupKhaltiPaymentDto } from "../dtos/khalti.dto";
import { KhaltiService } from "../services/khalti.service";

let khaltiService = new KhaltiService();

export class KhaltiController {
  async initiate(req: Request, res: Response) {
    try {
      const parsedData = InitiateKhaltiPaymentDto.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const data = await khaltiService.initiateKhaltiPayment({
        userId: userId.toString(),
        bookId: parsedData.data.bookId,
        amount: parsedData.data.amount,
        purchase_order_id: parsedData.data.purchase_order_id,
        purchase_order_name: parsedData.data.purchase_order_name,
        customer_info: parsedData.data.customer_info,
      });

      return res.status(200).json({
        success: true,
        data,
        message: "Khalti payment initiated",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async verify(req: Request, res: Response) {
    try {
      const parsedData = LookupKhaltiPaymentDto.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const data = await khaltiService.verifyKhaltiPayment({
        pidx: parsedData.data.pidx,
        userId: userId.toString(),
      });

      return res.status(200).json({
        success: true,
        data,
        message: "Khalti payment verified",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}