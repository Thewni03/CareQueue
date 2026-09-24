package lk.terminal.health.service;

/** Swap the mock for PayHere / Stripe by implementing this interface. */
public interface PaymentGateway {
    record Result(boolean ok, String reference, String message) {}
    Result charge(String method, int amountLkr, String cardNumber);
}
