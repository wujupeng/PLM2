package com.huaweicloud.plm.system.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

/**
 * N7 物料供应共享支撑服务：业务编号生成与可配置项读取，供各 WMS 模块复用。
 */
@Service
@RequiredArgsConstructor
public class WmsSupportService {

    private static final DateTimeFormatter NO_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final ConfigService configService;

    /**
     * 生成业务编号：前缀 + 时间戳（yyyyMMddHHmmss）+ 3 位随机数。
     */
    public String nextNo(String prefix) {
        String timestamp = NO_FORMATTER.format(LocalDateTime.now());
        int random = ThreadLocalRandom.current().nextInt(1000);
        return prefix + "-" + timestamp + String.format("%03d", random);
    }

    /**
     * 读取字符串配置，配置为空时返回默认值。
     */
    public String config(String key, String defaultValue) {
        String value = configService.getValue(key);
        return StringUtils.hasText(value) ? value : defaultValue;
    }

    /**
     * 读取整数配置，解析失败或配置为空时返回默认值。
     */
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

    /**
     * 读取小数配置，解析失败或配置为空时返回默认值。
     */
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

    /**
     * 读取布尔配置，仅当值为 true（忽略大小写）时为真，配置为空时返回默认值。
     */
    public boolean configBool(String key, boolean defaultValue) {
        String value = configService.getValue(key);
        if (!StringUtils.hasText(value)) {
            return defaultValue;
        }
        return "true".equalsIgnoreCase(value.trim());
    }
}
