import { KhaltiRepository } from "../../../repositories/khalti.repository";
import { KhaltiPaymentModel } from "../../../models/khalti.model";
import mongoose from "mongoose";

describe("Khalti Repository Unit Tests", () => {
  let khaltiRepository: KhaltiRepository;

  beforeAll(() => {
    khaltiRepository = new KhaltiRepository();
  });

  afterEach(async () => {
    await KhaltiPaymentModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test("should create a new payment", async () => {
    const data = {
      user: new mongoose.Types.ObjectId().toString(),
      book: new mongoose.Types.ObjectId().toString(),
      pidx: "test-pidx-001",
      amount: 1000,
      purchaseOrderId: "order-001",
      purchaseOrderName: "Test Book",
      status: "Initiated",
      isProcessed: false,
    };

    const payment = await khaltiRepository.createPayment(data as any);

    expect(payment).toBeDefined();
    expect(payment.pidx).toBe(data.pidx);
    expect(payment.amount).toBe(data.amount);
    expect(payment.status).toBe("Initiated");
  });

  test("should get payment by pidx", async () => {
    await KhaltiPaymentModel.create({
      user: new mongoose.Types.ObjectId(),
      book: new mongoose.Types.ObjectId(),
      pidx: "test-pidx-002",
      amount: 2000,
      purchaseOrderId: "order-002",
      purchaseOrderName: "Another Book",
      status: "Initiated",
      isProcessed: false,
    });

    const found = await khaltiRepository.getPaymentByPidx("test-pidx-002");

    expect(found).toBeDefined();
    expect(found?.pidx).toBe("test-pidx-002");
    expect(found?.amount).toBe(2000);
  });
});