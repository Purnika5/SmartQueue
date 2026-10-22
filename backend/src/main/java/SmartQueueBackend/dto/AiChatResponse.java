package SmartQueueBackend.dto;

public class AiChatResponse {
    private String reply;
    private Long recommendedServiceId;
    private String recommendedServiceName;
    private String action; // e.g. "JOIN_QUEUE", "INFO_ONLY"
    private String source; // "GEMINI_AI" or "SMART_KNOWLEDGE_BASE"
    private int estimatedWaitMinutes;

    public AiChatResponse() {}

    public AiChatResponse(String reply, Long recommendedServiceId, String recommendedServiceName, String action, String source, int estimatedWaitMinutes) {
        this.reply = reply;
        this.recommendedServiceId = recommendedServiceId;
        this.recommendedServiceName = recommendedServiceName;
        this.action = action;
        this.source = source;
        this.estimatedWaitMinutes = estimatedWaitMinutes;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public Long getRecommendedServiceId() {
        return recommendedServiceId;
    }

    public void setRecommendedServiceId(Long recommendedServiceId) {
        this.recommendedServiceId = recommendedServiceId;
    }

    public String getRecommendedServiceName() {
        return recommendedServiceName;
    }

    public void setRecommendedServiceName(String recommendedServiceName) {
        this.recommendedServiceName = recommendedServiceName;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public int getEstimatedWaitMinutes() {
        return estimatedWaitMinutes;
    }

    public void setEstimatedWaitMinutes(int estimatedWaitMinutes) {
        this.estimatedWaitMinutes = estimatedWaitMinutes;
    }
}
