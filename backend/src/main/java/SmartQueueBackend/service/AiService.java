package SmartQueueBackend.service;

import SmartQueueBackend.dto.AiChatRequest;
import SmartQueueBackend.dto.AiChatResponse;
import SmartQueueBackend.entity.QueueService;
import SmartQueueBackend.repository.CounterRepository;
import SmartQueueBackend.repository.QueueServiceRepository;
import SmartQueueBackend.repository.TicketRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Locale;

@Service
public class AiService {

    private final QueueServiceRepository queueServiceRepository;
    private final CounterRepository counterRepository;
    private final TicketRepository ticketRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${gemini.api.key:}")
    private String configuredGeminiApiKey;

    public AiService(
            QueueServiceRepository queueServiceRepository,
            CounterRepository counterRepository,
            TicketRepository ticketRepository) {
        this.queueServiceRepository = queueServiceRepository;
        this.counterRepository = counterRepository;
        this.ticketRepository = ticketRepository;
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public AiChatResponse processQuery(AiChatRequest request) {
        String query = request.getMessage() == null ? "" : request.getMessage().trim();
        String effectiveApiKey = getEffectiveApiKey(request.getApiKey());

        List<QueueService> services = queueServiceRepository.findAll();
        long totalWaiting = ticketRepository.countByStatus("WAITING");

        // Try Calling Google Gemini if key is available
        if (effectiveApiKey != null && !effectiveApiKey.isBlank()) {
            try {
                AiChatResponse geminiResponse = callGeminiApi(query, effectiveApiKey, services, totalWaiting);
                if (geminiResponse != null && geminiResponse.getReply() != null && !geminiResponse.getReply().isBlank()) {
                    return geminiResponse;
                }
            } catch (Exception ex) {
                System.err.println("Gemini API call failed, falling back to Knowledge Engine: " + ex.getMessage());
            }
        }

        // Fallback to SmartQueue Built-in Knowledge & Recommendation Engine
        return fallbackKnowledgeEngine(query, services, totalWaiting);
    }

    private String getEffectiveApiKey(String clientKey) {
        if (clientKey != null && !clientKey.isBlank()) {
            return clientKey.trim();
        }
        if (configuredGeminiApiKey != null && !configuredGeminiApiKey.isBlank()) {
            return configuredGeminiApiKey.trim();
        }
        String envKey = System.getenv("GEMINI_API_KEY");
        if (envKey != null && !envKey.isBlank()) {
            return envKey.trim();
        }
        return null;
    }

    private AiChatResponse callGeminiApi(String userPrompt, String apiKey, List<QueueService> services, long totalWaiting) {
        try {
            StringBuilder contextBuilder = new StringBuilder();
            contextBuilder.append("You are SmartQueue Copilot, an AI assistant for a smart queue management system. ")
                    .append("You assist students and visitors in institutions with required documents, queue status, and services.\n")
                    .append("Active services:\n");

            for (QueueService s : services) {
                long count = ticketRepository.countByService_IdAndStatus(s.getId(), "WAITING");
                contextBuilder.append("- ID: ").append(s.getId())
                        .append(", Name: ").append(s.getName())
                        .append(", Avg Service Time: ").append(s.getAverageServiceTime()).append(" min")
                        .append(", Current Waiting: ").append(count)
                        .append(", Desc: ").append(s.getDescription()).append("\n");
            }
            contextBuilder.append("Total campus queue waiting: ").append(totalWaiting).append("\n\n")
                    .append("Provide concise, well-structured, friendly guidance (use markdown bullet points where helpful).\n")
                    .append("If the user's intent relates to obtaining a service or token, mention the exact service name.");

            String systemAndUserPrompt = contextBuilder + "\n\nUser Question: " + userPrompt;

            String requestBody = objectMapper.writeValueAsString(
                    java.util.Map.of("contents", List.of(
                            java.util.Map.of("parts", List.of(
                                    java.util.Map.of("text", systemAndUserPrompt)
                            ))
                    ))
            );

            // Use gemini-2.5-flash / gemini-flash-latest endpoint
            String endpointUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(endpointUrl))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (httpResponse.statusCode() >= 200 && httpResponse.statusCode() < 300) {
                JsonNode root = objectMapper.readTree(httpResponse.body());
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    JsonNode parts = candidates.get(0).path("content").path("parts");
                    if (parts.isArray() && !parts.isEmpty()) {
                        String generatedText = parts.get(0).path("text").asText();

                        // Detect recommended service from query/response
                        QueueService match = matchService(userPrompt + " " + generatedText, services);
                        Long recId = match != null ? match.getId() : null;
                        String recName = match != null ? match.getName() : null;
                        int estWait = match != null ? match.getAverageServiceTime() : 5;
                        String action = recId != null ? "JOIN_QUEUE" : "INFO_ONLY";

                        return new AiChatResponse(generatedText, recId, recName, action, "GEMINI_AI", estWait);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error calling Gemini API: " + e.getMessage());
        }
        return null;
    }

    private AiChatResponse fallbackKnowledgeEngine(String query, List<QueueService> services, long totalWaiting) {
        String lower = query.toLowerCase(Locale.ROOT);

        // 1. Bonafide / Certificate Intent
        if (lower.contains("bonafide") || lower.contains("certificate") || lower.contains("study") || lower.contains("letter") || lower.contains("loan") || lower.contains("bus pass")) {
            QueueService s = findServiceByName(services, "Bonafide");
            Long sId = s != null ? s.getId() : 1L;
            long count = s != null ? ticketRepository.countByService_IdAndStatus(s.getId(), "WAITING") : 1;

            String reply = """
                ### 📄 Bonafide Certificate Guidelines
                
                To obtain a Bonafide Certificate from the administrative counter, please prepare:
                - **Student Identity Card** (or enrollment number)
                - **Tuition Fee Clearance Receipt** for the current term
                - **Formal Purpose Slip** (e.g. for Education Loan, Passport, Bus Pass, or Scholarship)
                
                📍 **Processing Desk:** Counter 01 (Academic & Certificates)
                ⏱️ **Average Service Time:** ~5 minutes
                👥 **Current Waiting in Line:** %d student(s)
                
                You can generate a digital token now to join this queue directly!
                """.formatted(count);

            return new AiChatResponse(reply, sId, "Bonafide Certificate", "JOIN_QUEUE", "SMART_KNOWLEDGE_BASE", 5);
        }

        // 2. ID Card Intent
        if (lower.contains("id") || lower.contains("card") || lower.contains("identity") || lower.contains("lost id") || lower.contains("badge")) {
            QueueService s = findServiceByName(services, "ID Card");
            Long sId = s != null ? s.getId() : 3L;
            long count = s != null ? ticketRepository.countByService_IdAndStatus(s.getId(), "WAITING") : 1;

            String reply = """
                ### 💳 ID Card Issuance & Renewal
                
                For new student/staff ID cards or lost card replacements:
                - **Admission / Appointment Letter**
                - **Two Recent Passport-sized Photographs** (white background)
                - **Government Photo ID** (Aadhaar / Driving License / Passport)
                - *If replacing a lost card:* A brief lost-property report or affidavit
                
                📍 **Processing Desk:** Counter 02 (Identification)
                ⏱️ **Average Service Time:** ~8 minutes
                👥 **Current Waiting in Line:** %d person(s)
                
                Click below to get a digital token for ID Card issuance.
                """.formatted(count);

            return new AiChatResponse(reply, sId, "ID Card Issue/Renewal", "JOIN_QUEUE", "SMART_KNOWLEDGE_BASE", 8);
        }

        // 3. Fee Payment / Accounts Intent
        if (lower.contains("fee") || lower.contains("pay") || lower.contains("due") || lower.contains("challan") || lower.contains("tuition") || lower.contains("fine")) {
            QueueService s = findServiceByName(services, "Fee");
            Long sId = s != null ? s.getId() : 4L;
            long count = s != null ? ticketRepository.countByService_IdAndStatus(s.getId(), "WAITING") : 0;

            String reply = """
                ### 💰 Fee Payment & Clearance
                
                To clear your tuition fees, exam fees, or fines:
                - **Student Roll Number / Enrollment ID**
                - **Fee Challan or Invoice Slip**
                - **Payment Method:** UPI, Debit/Credit Card, or Demand Draft
                
                📍 **Processing Desk:** Counter 03 (Accounts & Fees)
                ⏱️ **Average Service Time:** ~4 minutes
                👥 **Current Waiting in Line:** %d student(s)
                
                Ready to pay? Reserve your digital token right away.
                """.formatted(count);

            return new AiChatResponse(reply, sId, "Fee Payment", "JOIN_QUEUE", "SMART_KNOWLEDGE_BASE", 4);
        }

        // 4. Admissions / Counseling Intent
        if (lower.contains("admission") || lower.contains("counsel") || lower.contains("course") || lower.contains("join") || lower.contains("apply") || lower.contains("inquiry")) {
            QueueService s = findServiceByName(services, "Admission");
            Long sId = s != null ? s.getId() : 5L;
            long count = s != null ? ticketRepository.countByService_IdAndStatus(s.getId(), "WAITING") : 0;

            String reply = """
                ### 🎓 Admissions & Academic Counseling
                
                For new course inquiries, prospectus, and document submissions:
                - **10th & 12th Grade Marksheets** (Original & Photocopies)
                - **Transfer Certificate (TC)** and Conduct Certificate
                - **Entrance Scorecard** (if applicable)
                
                📍 **Processing Desk:** Counter 04 (Counseling Desk)
                ⏱️ **Average Service Time:** ~10 minutes
                👥 **Current Waiting in Line:** %d visitor(s)
                """.formatted(count);

            return new AiChatResponse(reply, sId, "Admissions & Counseling", "JOIN_QUEUE", "SMART_KNOWLEDGE_BASE", 10);
        }

        // 5. Wait time / Queue health inquiry
        if (lower.contains("wait") || lower.contains("time") || lower.contains("crowd") || lower.contains("queue") || lower.contains("status")) {
            String reply = """
                ### ⏱️ Live Queue Overview
                
                Here is the real-time queue status across the facility:
                - **Total Visitors Waiting:** %d
                - **Bonafide Certificates:** ~5 min wait
                - **ID Cards:** ~8 min wait
                - **Fee Accounts:** ~4 min wait (Fastest queue!)
                
                All counters are currently active. You can select any service in the kiosk to generate a digital token pass.
                """.formatted(totalWaiting);

            return new AiChatResponse(reply, null, null, "INFO_ONLY", "SMART_KNOWLEDGE_BASE", 5);
        }

        // Default General Greeting & Help
        String reply = """
            Hello! I am your **SmartQueue AI Copilot**. I can help you with:
            
            - 📄 **Document Requirements** for certificates, ID cards, and receipts
            - 🏢 **Counter Guidance** on where to go
            - ⏱️ **Real-time Wait Times** and queue recommendations
            - 🎫 **Instant Token Generation** for any service
            
            What service or inquiry would you like assistance with today?
            """;

        return new AiChatResponse(reply, null, null, "INFO_ONLY", "SMART_KNOWLEDGE_BASE", 5);
    }

    private QueueService findServiceByName(List<QueueService> services, String keyword) {
        return services.stream()
                .filter(s -> s.getName().toLowerCase(Locale.ROOT).contains(keyword.toLowerCase(Locale.ROOT)))
                .findFirst()
                .orElse(services.isEmpty() ? null : services.get(0));
    }

    private QueueService matchService(String text, List<QueueService> services) {
        String lower = text.toLowerCase(Locale.ROOT);
        for (QueueService s : services) {
            if (lower.contains(s.getName().toLowerCase(Locale.ROOT))) {
                return s;
            }
        }
        if (lower.contains("bonafide") || lower.contains("certificate")) return findServiceByName(services, "Bonafide");
        if (lower.contains("id") || lower.contains("card")) return findServiceByName(services, "ID Card");
        if (lower.contains("fee") || lower.contains("payment")) return findServiceByName(services, "Fee");
        if (lower.contains("admission") || lower.contains("counseling")) return findServiceByName(services, "Admission");
        return null;
    }
}
