// Type definitions for sip.js 0.7
// Project: http://sipjs.com
// Definitions by: Kir Dergachev <https://github.com/decyrus>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare interface SIP {
    UA: {
        new (configuration?: sipjs.ConfigurationParameters): sipjs.UA;
    };
    URI: {
        new (scheme?: string, user?: string, host?: string, port?: number, parameters?: string[], headers?: string[]): sipjs.URI;
        parse(uri: string): sipjs.URI;
    };
    NameAddrHeader: {
        new (uri: string | sipjs.URI, displayName: string, parameters: Array<{ key: string, value: string }>): sipjs.NameAddrHeader;
        parse(name_addr_header: string): sipjs.NameAddrHeader;
    };
}

declare namespace sipjs {

    interface URI {
        scheme?: string;
        user?: string;
        host?: string;
        port?: number;

        setParam(key: string, value?: string): void;
        getParam(key: string): string;
        hasParam(key: string): string;
        deleteParam(key: string): string;
        clearParams(): void;
        setHeader(name: string, value: string): void;
        getHeader(name: string): string[];
        hasHeader(name: string): boolean;
        deleteHeader(name: string): string[];
        clearHeaders(): void;
        clone(): URI;
        toString(): string;
    }

    namespace UA.EventArgs {
        interface ConnectedArgs { attempts: number; }
        interface UnregisteredArgs { response: string; cause: string; }
        interface RegistrationFailedArgs extends UnregisteredArgs { }
    }

    interface UA {
        start(): void;
        stop(): void;
        register(options?: ExtraHeadersOptions): UA;
        unregister(options?: UnregisterOptions): void;
        isRegistered(): boolean;
        isConnected(): boolean;
        message(target: string | URI, body: string, options?: MessageOptions): Message;
        subscribe(target: string | URI, event: string, options?: SubscribeOptions): Subscription;
        invite(target: string | URI, element?: InviteOptions | HTMLAudioElement | HTMLVideoElement): Session;
        request(method: string, target: string | URI, options?: RequestOptions): ClientContext;

        on(name: 'connected', callback: (args: UA.EventArgs.ConnectedArgs) => void): void;
        on(name: 'disconnected' | 'registered' | string, callback: () => void): void;
        on(name: 'unregistered', callback: (args: UA.EventArgs.UnregisteredArgs) => void): void;
        on(name: 'registrationFailed', callback: (args: UA.EventArgs.RegistrationFailedArgs) => void): void;
        on(name: 'invite', callback: (session: Session) => void): void;
        on(name: 'message', callback: (message: Message) => void): void;
    }

    namespace UA.C {
        class supported {
            REQUIRED: string;
            SUPPORTED: string;
            UNSUPPORTED: string;
        }

        class causes {
            INVALID_TARGET: string;
            CONNECTION_ERROR: string;
            REQUEST_TIMEOUT: string;
            SIP_FAILURE_CODE: string;
        }
    }

    interface Session {
        startTime?: Date;
        endTime?: Date;
        ua?: UA;
        method?: string;
        mediaHandler?: WebRTC.MediaHandler;
        request?: IncomingRequest | OutgoingRequest;
        localIdentity?: NameAddrHeader;
        remoteIdentity?: NameAddrHeader;
        data: ClientContext | ServerContext;

        dtmf(tone: string | number, options?: Session.DtmfOptions): Session;
        terminate(options?: Session.CommonOptions): Session;
        bye(options?: Session.CommonOptions): Session;
        getLocalStreams(): any[];
        getRemoteStreams(): any[];
        refer(target: string | Session, options?: ExtraHeadersOptions): Session;
        mute(options?: ExtraHeadersOptions): void;
        unmute(options?: ExtraHeadersOptions): void;
        cancel(options?: Session.CommonOptions): void;
        progress(options?: Session.ProgressOptions): void;
        accept(options?: Session.AcceptOptions): void;
        reject(options?: Session.CommonOptions): void;
        reply(options?: Session.CommonOptions): void;
        followRefer(callback: () => void): void;

        on(name: 'progress', callback: (response: IncomingResponse) => void): void;
        on(name: 'accepted', callback: (data: { code: number, response: IncomingResponse }) => void): void;
        on(name: 'failed' | 'rejected', callback: (response: IncomingResponse, cause: string) => void): void;
        on(name: 'terminated', callback: (message: IncomingResponse, cause: string) => void): void;
        on(name: 'cancel' | string, callback: () => void): void;
        on(name: 'replaced', callback: (newSession: Session) => void): void;
        on(name: 'dtmf', callback: (request: IncomingRequest, dtmf: Session.DTMF) => void): void;
        on(name: 'muted' | 'unmuted', callback: (data: Session.Muted) => void): void;
        on(name: 'refer' | 'bye', callback: (request: IncomingRequest) => void): void;
    }

    namespace Session {
        interface DtmfOptions extends ExtraHeadersOptions {
            duration?: number;
            interToneGap?: number;
        }

        interface CommonOptions extends ExtraHeadersOptions {
            status_code?: number;
            reason_phrase?: string;
            body?: string;
        }

        interface ProgressOptions extends ExtraHeadersOptions {
            rel100?: boolean;
            media?: MediaConstraints;
        }

        interface AcceptOptions {
            RTCConstraints?: any;
            media?: MediaOptions;
        }

        interface DTMF extends Object {}

        interface Muted {
            audio?: boolean;
            video?: boolean;
        }
    }

    interface RenderHint {
        remote?: Element;
        local?: Element;
    }

    interface MediaConstraints {
        audio: boolean;
        video: boolean;
    }

    interface TurnServer {
        urls?: string | string[];
        username?: string;
        password?: string;
    }

    namespace WebRTC {

        interface Options {
            stunServers?: string | string[];
            turnServers?: TurnServer | TurnServer[];
            RTCConstraints?: any;
        }

        type MediaHandlerFactory = (session: Session, options: Options) => MediaHandler;

        class MediaHandler {
            getLocalStreams(): any[];
            getRemoteStreams(): any[];
            render(renderHint: RenderHint): void;

            on(name: 'userMediaRequest', callback: (constraints: MediaConstraints) => void): void;
            on(name: 'addStream' | 'userMedia', callback: (stream: any) => void): void;
            on(name: 'userMediaFailed', callback: (error: string) => void): void;
            on(name: 'iceCandidate', callback: (candidate: any) => void): void;
            on(
                name: 'iceGathering' | 'iceGatheringComplete' | 'iceConnection' | 'iceConnectionChecking' | 'iceConnectionConnected' | 'iceConnectionCompleted' | 'iceConnectionFailed' |
                      'iceConnectionDisconnected' | 'iceConnectionClosed' | string,
                callback: () => void): void;
            on(name: 'dataChannel' | 'getDescription' | 'setDescription', callback: (sdpWrapper: { type: string, sdp: string }) => void): void;
        }
    }

    /* Parameters */
    interface ConfigurationParameters {
        uri?: string;
        wsServers?: string | string[] | Array<{ ws_uri: string; weigth: number }>;
        allowLegacyNotifications?: boolean;
        authenticationFactory?: WebRTC.MediaHandlerFactory;
        authorizationUser?: string;
        autostart?: boolean;
        connectionRecoveryMaxInterval?: number;
        connectionRecoveryMinInterval?: number;
        displayName?: string;
        hackCleanJitsiSdpImageattr?: boolean;
        hackStripTcp?: boolean;
        hackIpInContact?: boolean;
        hackViaTcp?: boolean;
        hackWssInTransport?: boolean;
        iceCheckingTimeout?: number;
        instanceId?: string;
        log?: {
            builtinEnabled?: boolean;
            level?: number | string;
            connector?: (level: string, category: string, label: string, content: string) => void;
        };
        mediaHandlerFactory?: WebRTC.MediaHandlerFactory;
        noAnswerTimeout?: number;
        password?: string;
        register?: boolean;
        registerExpires?: number;
        registrarServer?: string;
        rel100?: string;
        replaces?: string;
        stunServers?: string | string[];
        traceSip?: boolean;
        turnServers?: TurnServer | TurnServer[];
        usePreloadedRoute?: boolean;
        userAgentString?: string;
        wsServerMaxReconnection?: number;
        wsServerReconnectionTimeout?: number;
    }

    /* Options */
    interface ExtraHeadersOptions {
        extraHeaders?: string[];
    }

    interface UnregisterOptions extends ExtraHeadersOptions {
        all?: boolean;
    }

    interface MessageOptions extends ExtraHeadersOptions {
        contentType?: string;
    }

    interface SubscribeOptions extends ExtraHeadersOptions {
        expires?: number;
    }

    interface MediaOptions {
        constraints?: MediaConstraints;
        stream?: any;
        render?: RenderHint;
    }

    interface InviteOptions extends ExtraHeadersOptions {
        media?: MediaOptions;
        anonymous?: boolean;
        rel100?: string;
        inviteWithoutSdp?: boolean;
        RTCConstraints?: any;
    }

    interface RequestOptions extends ExtraHeadersOptions {
        body?: string;
    }

    /* Contexts */
    interface Message extends ClientContext {
        body: string;
    }

    interface Subscription extends ClientContext {
        id: string;
        state: string;
        event: string;
        dialog: string;
        timers: {};
        errorCodes: number[];
        subscribe(): Subscription;
        unsubscribe(): void;
        close(): void;
    }

    /* Context */
    interface Context {
        ua: UA;
        method: string;
        request: OutgoingRequest;
        localIdentity: NameAddrHeader;
        remoteIdentity: NameAddrHeader;
        data: {};
        on(name: 'progress' | 'accepted' | 'rejected' | 'failed', callback: (response: IncomingMessage, cause: string) => void): void;
        on(name: 'notify', callback: (request: IncomingRequest) => void): void;
        on(name: string, callback: () => void): void;
    }

    interface ClientContext extends Context {
        cancel(options?: { status_code?: number, reason_phrase?: string }): ClientContext;
    }

    interface ServerContext extends Context {
        progress(options?: Session.ProgressOptions): void;
        accept(options?: Session.AcceptOptions): void;
        reject(options?: Session.CommonOptions): void;
        reply(options?: Session.CommonOptions): void;
    }

    /* Request */
    interface Request extends Context {
    }

    interface IncomingRequest extends Request {
    }

    interface OutgoingRequest extends Request {
    }

    interface IncomingResponse extends Request {
    }

    interface IncomingMessage extends Request {
    }

    /* Header */
    interface NameAddrHeader {
        uri: string | URI;
        displayName: string;

        setParam(key: string, value?: string): void;
        getParam(key: string): string;
        deleteParam(key: string): string;
        clearParams(): void;
    }
}
