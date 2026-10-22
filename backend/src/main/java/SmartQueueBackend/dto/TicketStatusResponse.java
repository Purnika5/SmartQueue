package SmartQueueBackend.dto;

import SmartQueueBackend.entity.Ticket;

public class TicketStatusResponse {
    private Ticket ticket;
    private long positionAhead;
    private int estimatedWaitMinutes;
    private String serviceName;
    private String counterName;
    private String status;

    public TicketStatusResponse() {}

    public TicketStatusResponse(Ticket ticket, long positionAhead, int estimatedWaitMinutes) {
        this.ticket = ticket;
        this.positionAhead = positionAhead;
        this.estimatedWaitMinutes = estimatedWaitMinutes;
        if (ticket != null) {
            this.status = ticket.getStatus();
            if (ticket.getService() != null) {
                this.serviceName = ticket.getService().getName();
            }
            if (ticket.getCounter() != null) {
                this.counterName = ticket.getCounter().getName();
            }
        }
    }

    public Ticket getTicket() {
        return ticket;
    }

    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }

    public long getPositionAhead() {
        return positionAhead;
    }

    public void setPositionAhead(long positionAhead) {
        this.positionAhead = positionAhead;
    }

    public int getEstimatedWaitMinutes() {
        return estimatedWaitMinutes;
    }

    public void setEstimatedWaitMinutes(int estimatedWaitMinutes) {
        this.estimatedWaitMinutes = estimatedWaitMinutes;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getCounterName() {
        return counterName;
    }

    public void setCounterName(String counterName) {
        this.counterName = counterName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
