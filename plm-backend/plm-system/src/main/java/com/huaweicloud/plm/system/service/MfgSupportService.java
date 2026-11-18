package com.huaweicloud.plm.system.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * N8 生产执行与追溯共享支撑服务：业务编号生成与可配置项读取。
 */
@Service
@RequiredArgsConstructor
public class MfgSupportService {

    private static final DateTimeFormatter NO_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    /** 同一秒内的自增序号，保证单实例内编号唯一（避免随机数撞号）。 */
    private static final AtomicInteger SECOND_SEQUENCE = new AtomicInteger(0);

    private final ConfigService configService;

    /**
     * 生成业务编号：前缀 + 时间戳（yyyyMMddHHmmss）+ 秒内自增序号（3 位）+ 随机数（3 位）。
     * 秒内自增序号保证单实例唯一，随机数降低多实例并发撞号概率。
     */
    public String nextNo(String prefix) {
        String timestamp = NO_FORMATTER.format(LocalDateTime.now());
        int sequence = SECOND_SEQUENCE.updateAndGet(value -> value >= 999 ? 0 : value + 1);
        int random = ThreadLocalRandom.current().nextInt(1000);
        return prefix + "-" + timestamp + String.format("%03d%03d", sequence, random);
    }

    public String config(String key, String defaultValue) {
        String value = configService.getValue(key);
        return StringUtils.hasText(value) ? value : defaultValue;
    }

    public int configInt(String key, int defaultValue) {
        String value = configService.getValue(key);
        if (!StringUtils.hasText(value)) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    public BigDecimal configDecimal(String key, BigDecimal defaultValue) {
        String value = configService.getValue(key);
        if (!StringUtils.hasText(value)) {
            return defaultValue;
        }
        try {
            return new BigDecimal(value.trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    public boolean configBool(String key, boolean defaultValue) {
        String value = configService.getValue(key);
        if (!StringUtils.hasText(value)) {
            return defaultValue;
        }
        return "true".equalsIgnoreCase(value.trim());
    }
}
