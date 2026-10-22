package SmartQueueBackend.dto;

import SmartQueueBackend.entity.Ticket;
import java.util.List;

public class QueueBoardResponse {
    private List<NowServingItem> nowServing;
    private List<Ticket> waitingTickets;
    private long totalWaiting;
    private long totalServedToday;
    private int activeCountersCount;

    public static class NowServingItem {
        private Long counterId;
        private String counterName;
        private String tokenNumber;
        private String serviceName;
        private String calledAt;

        public NowServingItem() {}

        public NowServingItem(Long counterId, String counterName, String tokenNumber, String serviceName, String calledAt) {
            this.counterId = counterId;
            this.counterName = counterName;
            this.tokenNumber = tokenNumber;
            this.serviceName = serviceName;
            this.calledAt = calledAt;
        }

        public Long getCounterId() {
            return counterId;
        }

        public void setCounterId(Long counterId) {
            this.counterId = counterId;
        }

        public String getCounterName() {
            return counterName;
        }

        public void setCounterName(String counterName) {
            this.counterName = counterName;
        }

        public String getTokenNumber() {
            return tokenNumber;
        }

        public void setTokenNumber(String tokenNumber) {
            this.tokenNumber = tokenNumber;
        }

        public String getServiceName() {
            return serviceName;
        }

        public void setServiceName(String serviceName) {
            this.serviceName = serviceName;
        }

        public String getCalledAt() {
            return calledAt;
        }

        public void setCalledAt(String calledAt) {
            this.calledAt = calledAt;
        }
    }

    public QueueBoardResponse() {}

    public List<NowServingItem> getNowServing() {
        return nowServing;
    }

    public void setNowServing(List<NowServingItem> nowServing) {
        this.nowServing = nowServing;
    }

    public List<Ticket> getWaitingTickets() {
        return waitingTickets;
    }

    public void setWaitingTickets(List<Ticket> waitingTickets) {
        this.waitingTickets = waitingTickets;
    }

    public long getTotalWaiting() {
        return totalWaiting;
    }

    public void setTotalWaiting(long totalWaiting) {
        this.totalWaiting = totalWaiting;
    }

    public long getTotalServedToday() {
        return totalServedToday;
    }

    public void setTotalServedToday(long totalServedToday) {
        this.totalServedToday = totalServedToday;
    }

    public int getActiveCountersCount() {
        return activeCountersCount;
    }

    public void setActiveCountersCount(int activeCountersCount) {
        this.activeCountersCount = activeCountersCount;
    }
}
