package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.SrmEdiReceiptQuery;
import com.huaweicloud.plm.system.dto.SrmEdiReceiptSaveRequest;
import com.huaweicloud.plm.system.entity.SrmEdiReceipt;
import com.huaweicloud.plm.system.mapper.SrmEdiReceiptMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * SRM EDI 协同—EDI 回执（对应 EDI 回执）：
 * 回执登记、分页查询与删除。
 * 回执编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SrmEdiReceiptService {

    private static final String DEFAULT_RECEIPT_NO_PREFIX = "ERC";
    private static final String DEFAULT_RECEIPT_TYPE = "ACK";
    private static final String DEFAULT_RECEIPT_STATUS = "RECEIVED";

    private final SrmEdiReceiptMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询 EDI 回执记录：回执类型/回执状态/合作方编码/EDI 报文编号精确，回执编号/EDI 报文编号/合作方编码/合作方名称/回执代码模糊，按主键倒序。 */
    public PageResult<SrmEdiReceipt> page(SrmEdiReceiptQuery query) {
        Page<SrmEdiReceipt> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SrmEdiReceipt>lambdaQuery()
                .eq(StringUtils.hasText(query.getReceiptType()),
                        SrmEdiReceipt::getReceiptType, query.getReceiptType())
                .eq(StringUtils.hasText(query.getReceiptStatus()),
                        SrmEdiReceipt::getReceiptStatus, query.getReceiptStatus())
                .eq(StringUtils.hasText(query.getPartnerCode()),
                        SrmEdiReceipt::getPartnerCode, query.getPartnerCode())
                .eq(StringUtils.hasText(query.getEdiNo()),
                        SrmEdiReceipt::getEdiNo, query.getEdiNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SrmEdiReceipt::getReceiptNo, query.getKeyword()).or()
                        .like(SrmEdiReceipt::getEdiNo, query.getKeyword()).or()
                        .like(SrmEdiReceipt::getPartnerCode, query.getKeyword()).or()
                        .like(SrmEdiReceipt::getPartnerName, query.getKeyword()).or()
                        .like(SrmEdiReceipt::getReceiptCode, query.getKeyword()))
                .orderByDesc(SrmEdiReceipt::getId));
        return PageResult.of(page);
    }

    public SrmEdiReceipt detail(Long id) {
        return require(id);
    }

    /** 新增或更新 EDI 回执记录：新增时回填默认回执类型、回执状态与组织，回执编号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SrmEdiReceiptSaveRequest request) {
        SrmEdiReceipt entity;
        if (id == null) {
            entity = new SrmEdiReceipt();
            entity.setReceiptNo(StringUtils.hasText(request.getReceiptNo())
                    ? request.getReceiptNo() : flowSupport.nextBizNo(DEFAULT_RECEIPT_NO_PREFIX));
            entity.setReceiptType(StringUtils.hasText(request.getReceiptType())
                    ? request.getReceiptType() : DEFAULT_RECEIPT_TYPE);
            entity.setReceiptStatus(StringUtils.hasText(request.getReceiptStatus())
                    ? request.getReceiptStatus() : DEFAULT_RECEIPT_STATUS);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
        }
        applyRequest(entity, request);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 删除 EDI 回执记录：物理删除以释放回执编号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public SrmEdiReceipt require(Long id) {
        SrmEdiReceipt entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "EDI回执不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、日期非空）时覆盖实体对应字段。 */
    private void applyRequest(SrmEdiReceipt entity, SrmEdiReceiptSaveRequest request) {
        if (StringUtils.hasText(request.getReceiptNo())) {
            entity.setReceiptNo(request.getReceiptNo());
        }
        if (StringUtils.hasText(request.getEdiNo())) {
            entity.setEdiNo(request.getEdiNo());
        }
        if (StringUtils.hasText(request.getPartnerCode())) {
            entity.setPartnerCode(request.getPartnerCode());
        }
        if (StringUtils.hasText(request.getPartnerName())) {
            entity.setPartnerName(request.getPartnerName());
        }
        if (StringUtils.hasText(request.getReceiptType())) {
            entity.setReceiptType(request.getReceiptType());
        }
        if (StringUtils.hasText(request.getReceiptCode())) {
            entity.setReceiptCode(request.getReceiptCode());
        }
        if (StringUtils.hasText(request.getReceiptDesc())) {
            entity.setReceiptDesc(request.getReceiptDesc());
        }
        if (request.getReceivedTime() != null) {
            entity.setReceivedTime(request.getReceivedTime());
        }
        if (StringUtils.hasText(request.getReceiptStatus())) {
            entity.setReceiptStatus(request.getReceiptStatus());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getDescription())) {
            entity.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
