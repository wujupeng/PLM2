package com.huaweicloud.plm.system.service;

import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.entity.EdiTransactionLog;
import com.huaweicloud.plm.system.mapper.EdiTransactionLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

/**
 * EDI 共享支撑服务（N6）：编号生成、交易日志写入、配置项读取，供各 EDI 模块复用。
 */
@Service
@RequiredArgsConstructor
public class EdiSupportService {

    private static final DateTimeFormatter NO_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final EdiTransactionLogMapper transactionLogMapper;
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
     * 写入 EDI 交易日志，自动填充日志编号、日志时间与操作人信息。
     */
    public void writeLog(String messageNo, String partnerCode, String transCode, String direction,
                         String actionType, String result, String message, String refNo) {
        EdiTransactionLog log = new EdiTransactionLog();
        log.setLogNo(nextNo("LOG"));
        log.setMessageNo(messageNo);
        log.setPartnerCode(partnerCode);
        log.setTransCode(transCode);
        log.setDirection(direction);
        log.setActionType(actionType);
        log.setResult(result);
        log.setMessage(message);
        log.setRefNo(refNo);
        log.setOperatorId(UserContext.getUserId());
        log.setOperatorName(UserContext.getUsername());
        log.setLogAt(LocalDateTime.now());
        transactionLogMapper.insert(log);
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
    public Integer configInt(String key, int defaultValue) {
        String value = configService.getValue(key);
        if (!StringUtils.hasText(value)) {
            return defaultValue;
        }
        try {
            return Integer.valueOf(value.trim());
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
