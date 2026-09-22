package lk.terminal.health.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import java.io.FileInputStream;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private boolean ready = false;

    public NotificationService(@Value("${app.fcm.credentials}") String path) {
        if (path == null || path.isBlank()) { log.info("FCM disabled (no credentials). Notifications will be logged."); return; }
        try (FileInputStream in = new FileInputStream(path)) {
            FirebaseApp.initializeApp(FirebaseOptions.builder().setCredentials(GoogleCredentials.fromStream(in)).build());
            ready = true;
        } catch (Exception e) { log.error("FCM init failed: {}", e.getMessage()); }
    }

    public void push(String fcmToken, String title, String body) {
        log.info("PUSH -> {} | {}", title, body);
        if (!ready || fcmToken == null || fcmToken.isBlank()) return;
        try {
            FirebaseMessaging.getInstance().send(Message.builder().setToken(fcmToken)
                .setNotification(Notification.builder().setTitle(title).setBody(body).build()).build());
        } catch (Exception e) { log.warn("FCM send failed: {}", e.getMessage()); }
    }
}
