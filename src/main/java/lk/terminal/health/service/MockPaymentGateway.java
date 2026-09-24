package lk.terminal.health.service;

import java.util.UUID;
import org.springframework.stereotype.Component;

/** Demo gateway: approves everything except cards ending in 0002 (declined) so the failure path can be shown. */
@Component
public class MockPaymentGateway implements PaymentGateway {
    @Override
    public Result charge(String method, int amountLkr, String cardNumber) {
        if (cardNumber != null && cardNumber.endsWith("0002")) return new Result(false, null, "Your card was declined. Try another card.");
        return new Result(true, "SIM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(), "approved");
    }
}
