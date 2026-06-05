package com.healthcare.gateway.filter;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;

@Component
@Slf4j
public class LoggingFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        Instant start = Instant.now();
        String method = exchange.getRequest().getMethod().name();
        String path   = exchange.getRequest().getURI().getPath();

        return chain.filter(exchange).doFinally(signalType -> {
            long elapsed = Duration.between(start, Instant.now()).toMillis();
            int status   = exchange.getResponse().getStatusCode() != null
                    ? exchange.getResponse().getStatusCode().value() : 0;
            log.info("[GATEWAY] {} {} -> {} ({}ms)", method, path, status, elapsed);
        });
    }
