package com.healthcare.prescription.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
@Slf4j
public class FeignAuthInterceptor implements RequestInterceptor {

    private static final String AUTHORIZATION = "Authorization";
    private static final String BEARER = "Bearer ";

    @Override
    public void apply(RequestTemplate template) {

        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

        if (attributes == null) {
            log.warn("No request context found. Skipping token forwarding.");
            return;
        }

        HttpServletRequest request = attributes.getRequest();
        String authHeader = request.getHeader(AUTHORIZATION);

        if (authHeader == null) {
            log.warn("No Authorization header found in request.");
            return;
        }

        if (!authHeader.startsWith(BEARER)) {
            log.warn("Authorization header is not a Bearer token.");
            return;
        }

        // ✅ Forward token to downstream service (patient-service)
        template.header(AUTHORIZATION, authHeader);

        log.info("Forwarding JWT token to downstream service");
    }
}