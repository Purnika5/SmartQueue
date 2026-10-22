package SmartQueueBackend.dto;

import java.util.Map;

public class QueueStatsResponse {
    private long totalTickets;
    private long waitingCount;
    private long calledCount;
    private long completedCount;
    private long skippedCount;
    private int activeCounters;
    private double avgWaitTimeMinutes;
    private Map<String, Long> serviceQueueCounts;

    public QueueStatsResponse() {}

    public long getTotalTickets() {
        return totalTickets;
    }

    public void setTotalTickets(long totalTickets) {
        this.totalTickets = totalTickets;
    }

    public long getWaitingCount() {
        return waitingCount;
    }

    public void setWaitingCount(long waitingCount) {
        this.waitingCount = waitingCount;
    }

    public long getCalledCount() {
        return calledCount;
    }

    public void setCalledCount(long calledCount) {
        this.calledCount = calledCount;
    }

    public long getCompletedCount() {
        return completedCount;
    }

    public void setCompletedCount(long completedCount) {
        this.completedCount = completedCount;
    }

    public long getSkippedCount() {
        return skippedCount;
    }

    public void setSkippedCount(long skippedCount) {
        this.skippedCount = skippedCount;
    }

    public int getActiveCounters() {
        return activeCounters;
    }

    public void setActiveCounters(int activeCounters) {
        this.activeCounters = activeCounters;
    }

    public double getAvgWaitTimeMinutes() {
        return avgWaitTimeMinutes;
    }

    public void setAvgWaitTimeMinutes(double avgWaitTimeMinutes) {
        this.avgWaitTimeMinutes = avgWaitTimeMinutes;
    }

    public Map<String, Long> getServiceQueueCounts() {
        return serviceQueueCounts;
    }

    public void setServiceQueueCounts(Map<String, Long> serviceQueueCounts) {
        this.serviceQueueCounts = serviceQueueCounts;
    }
}
