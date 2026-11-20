package com.huaweicloud.plm.gateway.config;

import io.lettuce.core.ClientOptions;
import io.lettuce.core.resource.ClientResources;
import io.lettuce.core.resource.DefaultClientResources;
import io.lettuce.core.resource.Delay;
import org.springframework.boot.autoconfigure.data.redis.LettuceClientConfigurationBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RedisClientConfig {

    @Bean(destroyMethod = "shutdown")
    ClientResources lettuceClientResources() {
        return DefaultClientResources.builder()
                .reconnectDelay(Delay.exponential())
                .build();
    }

    @Bean
    LettuceClientConfigurationBuilderCustomizer redisReconnectCustomizer(ClientResources clientResources) {
        return builder -> builder
                .clientResources(clientResources)
                .clientOptions(ClientOptions.builder()
                        .autoReconnect(true)
                        .disconnectedBehavior(ClientOptions.DisconnectedBehavior.REJECT_COMMANDS)
                        .build());
    }
}
