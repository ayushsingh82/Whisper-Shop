import type { Candidate, Fulfillment, IncomingMemo, InvoiceInfo, Shop, Swapper, Wallet } from "./types";

/** SIMULATED adapters for tests and offline demos. Never presented as real in the UI. */
export class MockWallet implements Wallet {
  inbox: IncomingMemo[] = [];
  sent: { to: string; memo: string }[] = [];
  async poll() { const x = this.inbox; this.inbox = []; return x; }
  async sendMemo(to: string, memo: string) { this.sent.push({ to, memo }); return `mocktx-${this.sent.length}`; }
}

export class MockShop implements Shop {
  constructor(public catalog: Candidate[] = [{ productId: "esim-thailand", name: "Thailand 5GB / 7d eSIM", packageValue: "5", priceUsd: 9.4 }]) {}
  async search() { return this.catalog; }
  async createInvoice(c: Candidate, payMethod: string): Promise<InvoiceInfo> {
    return { invoiceId: "inv-mock-1", payMethod, payAddress: "mock-address", payAmount: "0.001", priceUsd: c.priceUsd, expiresMinutes: 15 };
  }
  async getFulfillment(): Promise<Fulfillment> { return { status: "complete", code: "LPA:1$mock.smdp$TESTCODE" }; }
}

export class MockSwapper implements Swapper {
  async swapAndPay(_i: InvoiceInfo, budget: bigint) { return { ref: "mock-swap-1", spentZatoshi: budget }; }
}
