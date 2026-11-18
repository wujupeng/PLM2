package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.EdiPartnerQuery;
import com.huaweicloud.plm.system.dto.EdiPartnerSaveRequest;
import com.huaweicloud.plm.system.entity.EdiPartner;
import com.huaweicloud.plm.system.mapper.EdiPartnerMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * EDI 伙伴与通道服务（N6，DEV-063）。
 */
@Service
@RequiredArgsConstructor
public class EdiPartnerService {

    private static final String DEFAULT_PARTNER_TYPE = "CUSTOMER";
    private static final String DEFAULT_PROTOCOL = "SFTP";
    private static final String DEFAULT_CHARSET = "UTF-8";
    private static final String STATUS_ENABLED = "enabled";

    private final EdiPartnerMapper ediPartnerMapper;

    public PageResult<EdiPartner> page(EdiPartnerQuery query) {
        Page<EdiPartner> page = query.toPage();
        ediPartnerMapper.selectPage(page, Wrappers.<EdiPartner>lambdaQuery()
                .eq(StringUtils.hasText(query.getPartnerType()), EdiPartner::getPartnerType, query.getPartnerType())
                .eq(StringUtils.hasText(query.getProtocol()), EdiPartner::getProtocol, query.getProtocol())
                .eq(StringUtils.hasText(query.getStatus()), EdiPartner::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(EdiPartner::getPartnerCode, query.getKeyword()).or()
                        .like(EdiPartner::getPartnerName, query.getKeyword()))
                .orderByAsc(EdiPartner::getPartnerCode));
        return PageResult.of(page);
    }

    public List<EdiPartner> options(String partnerType) {
        return ediPartnerMapper.selectList(Wrappers.<EdiPartner>lambdaQuery()
                .eq(EdiPartner::getStatus, STATUS_ENABLED)
                .eq(StringUtils.hasText(partnerType), EdiPartner::getPartnerType, partnerType)
                .orderByAsc(EdiPartner::getPartnerCode));
    }

    public EdiPartner requirePartner(Long id) {
        EdiPartner partner = ediPartnerMapper.selectById(id);
        if (partner == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "EDI 伙伴不存在: " + id);
        }
        return partner;
    }

    public EdiPartner requireByCode(String partnerCode) {
        EdiPartner partner = ediPartnerMapper.selectOne(Wrappers.<EdiPartner>lambdaQuery()
                .eq(EdiPartner::getPartnerCode, partnerCode));
        if (partner == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "EDI 伙伴不存在: " + partnerCode);
        }
        return partner;
    }

    public Long create(EdiPartnerSaveRequest request) {
        ensureUnique(request.getPartnerCode(), -1L);
        EdiPartner partner = new EdiPartner();
        applyRequest(partner, request);
        ediPartnerMapper.insert(partner);
        return partner.getId();
    }

    public void update(Long id, EdiPartnerSaveRequest request) {
        EdiPartner partner = requirePartner(id);
        ensureUnique(request.getPartnerCode(), id);
        applyRequest(partner, request);
        ediPartnerMapper.updateById(partner);
    }

    public void delete(Long id) {
        requirePartner(id);
        ediPartnerMapper.deleteById(id);
    }

    private void applyRequest(EdiPartner partner, EdiPartnerSaveRequest request) {
        partner.setPartnerCode(request.getPartnerCode());
        partner.setPartnerName(request.getPartnerName());
        partner.setPartnerType(StringUtils.hasText(request.getPartnerType())
                ? request.getPartnerType() : DEFAULT_PARTNER_TYPE);
        partner.setPartnerId(request.getPartnerId());
        partner.setProtocol(StringUtils.hasText(request.getProtocol())
                ? request.getProtocol() : DEFAULT_PROTOCOL);
        partner.setEndpoint(request.getEndpoint());
        partner.setPort(request.getPort());
        partner.setRemotePath(request.getRemotePath());
        partner.setUsername(request.getUsername());
        partner.setSecretRef(request.getSecretRef());
        partner.setCertSubject(request.getCertSubject());
        partner.setCertExpireDate(request.getCertExpireDate());
        partner.setCharset(StringUtils.hasText(request.getCharset())
                ? request.getCharset() : DEFAULT_CHARSET);
        partner.setContact(request.getContact());
        partner.setEmail(request.getEmail());
        partner.setStatus(StringUtils.hasText(request.getStatus())
                ? request.getStatus() : STATUS_ENABLED);
        partner.setRemark(request.getRemark());
    }

    private void ensureUnique(String partnerCode, Long excludeId) {
        long count = ediPartnerMapper.selectCount(Wrappers.<EdiPartner>lambdaQuery()
                .eq(EdiPartner::getPartnerCode, partnerCode)
                .ne(excludeId != null && excludeId > 0, EdiPartner::getId, excludeId));
        if (count > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "EDI 伙伴编码已存在: " + partnerCode);
        }
    }
}
