package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.BizI18nLocaleSaveRequest;
import com.huaweicloud.plm.system.dto.BizI18nMessageSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaI18nLocale;
import com.huaweicloud.plm.system.entity.OaI18nMessage;
import com.huaweicloud.plm.system.mapper.OaI18nLocaleMapper;
import com.huaweicloud.plm.system.mapper.OaI18nMessageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 国际化与多语言（OA-DEV-084）：语言区域（时区、日期格式、币种）与语言包条目维护。
 * 默认区域取自可配置项 oa.i18n.default.locale。
 */
@Service
@RequiredArgsConstructor
public class OaI18nService {

    private final OaI18nLocaleMapper localeMapper;
    private final OaI18nMessageMapper messageMapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaI18nLocale> pageLocale(OaBizFlowQuery query) {
        Page<OaI18nLocale> page = query.toPage();
        localeMapper.selectPage(page, Wrappers.<OaI18nLocale>lambdaQuery()
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaI18nLocale::getLocaleCode, query.getKeyword()).or()
                        .like(OaI18nLocale::getLocaleName, query.getKeyword()))
                .orderByDesc(OaI18nLocale::getIsDefault)
                .orderByAsc(OaI18nLocale::getLocaleCode));
        return PageResult.of(page);
    }

    /** 启用中的语言区域列表。 */
    public List<OaI18nLocale> listEnabledLocale() {
        return localeMapper.selectList(Wrappers.<OaI18nLocale>lambdaQuery()
                .eq(OaI18nLocale::getStatus, 1)
                .orderByDesc(OaI18nLocale::getIsDefault)
                .orderByAsc(OaI18nLocale::getLocaleCode));
    }

    @Transactional
    public Long saveLocale(Long id, BizI18nLocaleSaveRequest request) {
        if (!StringUtils.hasText(request.getLocaleCode())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "区域代码不能为空");
        }
        OaI18nLocale entity;
        if (id == null) {
            entity = new OaI18nLocale();
            entity.setLocaleCode(request.getLocaleCode());
            entity.setStatus(request.getStatus() == null ? 1 : request.getStatus());
        } else {
            entity = requireLocale(id);
        }
        entity.setLocaleName(request.getLocaleName());
        entity.setLanguageCode(request.getLanguageCode());
        entity.setCountryCode(request.getCountryCode());
        entity.setTimezone(StringUtils.hasText(request.getTimezone()) ? request.getTimezone() : "Asia/Shanghai");
        entity.setDateFormat(StringUtils.hasText(request.getDateFormat()) ? request.getDateFormat() : "YYYY-MM-DD");
        entity.setTimeFormat(StringUtils.hasText(request.getTimeFormat()) ? request.getTimeFormat() : "HH:mm:ss");
        entity.setNumberFormat(request.getNumberFormat());
        entity.setCurrencyCode(StringUtils.hasText(request.getCurrencyCode()) ? request.getCurrencyCode() : "CNY");
        entity.setIsDefault(Boolean.TRUE.equals(request.getIsDefault()) ? 1 : 0);
        entity.setRemark(request.getRemark());
        if (id == null) {
            localeMapper.insert(entity);
        } else {
            localeMapper.updateById(entity);
        }
        if (Integer.valueOf(1).equals(entity.getIsDefault())) {
            resetOtherDefault(entity.getId());
        }
        return entity.getId();
    }

    @Transactional
    public void deleteLocale(Long id) {
        OaI18nLocale locale = requireLocale(id);
        if (Integer.valueOf(1).equals(locale.getIsDefault())) {
            throw new BusinessException(ResultCode.CONFLICT, "默认区域不可删除");
        }
        messageMapper.delete(Wrappers.<OaI18nMessage>lambdaQuery()
                .eq(OaI18nMessage::getLocaleCode, locale.getLocaleCode()));
        localeMapper.deleteById(id);
    }

    public PageResult<OaI18nMessage> pageMessage(OaBizFlowQuery query) {
        Page<OaI18nMessage> page = query.toPage();
        messageMapper.selectPage(page, Wrappers.<OaI18nMessage>lambdaQuery()
                .eq(StringUtils.hasText(query.getTypeCode()), OaI18nMessage::getLocaleCode, query.getTypeCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaI18nMessage::getMessageKey, query.getKeyword()).or()
                        .like(OaI18nMessage::getMessageValue, query.getKeyword()))
                .orderByAsc(OaI18nMessage::getLocaleCode)
                .orderByAsc(OaI18nMessage::getMessageKey));
        return PageResult.of(page);
    }

    /** 按区域查询语言包，供前端加载。 */
    public List<OaI18nMessage> listMessageByLocale(String localeCode) {
        String locale = StringUtils.hasText(localeCode) ? localeCode
                : flowSupport.configString("oa.i18n.default.locale", "zh-CN");
        return messageMapper.selectList(Wrappers.<OaI18nMessage>lambdaQuery()
                .eq(OaI18nMessage::getLocaleCode, locale)
                .orderByAsc(OaI18nMessage::getMessageKey));
    }

    @Transactional
    public Long saveMessage(Long id, BizI18nMessageSaveRequest request) {
        if (!StringUtils.hasText(request.getLocaleCode()) || !StringUtils.hasText(request.getMessageKey())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "区域代码与消息键不能为空");
        }
        OaI18nMessage entity;
        if (id == null) {
            entity = new OaI18nMessage();
        } else {
            entity = messageMapper.selectById(id);
            if (entity == null) {
                throw new BusinessException(ResultCode.NOT_FOUND, "语言包条目不存在: " + id);
            }
        }
        entity.setLocaleCode(request.getLocaleCode());
        entity.setMessageKey(request.getMessageKey());
        entity.setMessageValue(request.getMessageValue());
        entity.setModule(request.getModule());
        entity.setRemark(request.getRemark());
        if (id == null) {
            messageMapper.insert(entity);
        } else {
            messageMapper.updateById(entity);
        }
        return entity.getId();
    }

    @Transactional
    public void deleteMessage(Long id) {
        if (messageMapper.selectById(id) == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "语言包条目不存在: " + id);
        }
        messageMapper.deleteById(id);
    }

    public OaI18nLocale requireLocale(Long id) {
        OaI18nLocale entity = localeMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "语言区域不存在: " + id);
        }
        return entity;
    }

    private void resetOtherDefault(Long keepId) {
        List<OaI18nLocale> others = localeMapper.selectList(Wrappers.<OaI18nLocale>lambdaQuery()
                .eq(OaI18nLocale::getIsDefault, 1)
                .ne(OaI18nLocale::getId, keepId));
        for (OaI18nLocale other : others) {
            other.setIsDefault(0);
            localeMapper.updateById(other);
        }
    }
}
