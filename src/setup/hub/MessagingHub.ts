import * as signalR from "@microsoft/signalr";
import { AppConfiguration } from "read-appsettings-json";

export function createHubConnenction(): signalR.HubConnection {
    const hubUrl = AppConfiguration.Setting().REACT_APP_MLAB_HUB_URL!;
    const hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
            skipNegotiation: true,
            transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();
    hubConnection.keepAliveIntervalInMilliseconds = 30000;
    hubConnection.serverTimeoutInMilliseconds = 30000;
    return hubConnection
}