package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsAsnQuery;
import com.huaweicloud.plm.system.dto.WmsAsnSaveRequest;
import com.huaweicloud.plm.system.entity.WmsAsn;
import com.huaweicloud.plm.system.mapper.WmsAsnMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * WMS 收货上架—收货通知单（对应收货通知单）：
 * 收货通知单登记、分页查询与删除。
 * 收货通知单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class WmsAsnService {

    private static final String DEFAULT_ASN_NO_PREFIX = "ASN";
    private static final String DEFAULT_ASN_STATUS = "DRAFT";
    private static final String DEFAULT_ASN_TYPE = "PURCHASE";

    private final WmsAsnMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询收货通知单记录：ASN 类型/ASN 状态/供应商编码/采购委外单号精确，收货通知单号/供应商编码/供应商名称/采购委外单号模糊，按主键倒序。 */
    public PageResult<WmsAsn> page(WmsAsnQuery query) {
        Page<WmsAsn> page = query.toPage();
        mapper.selectPage(page, Wrappers.<WmsAsn>lambdaQuery()
                .eq(StringUtils.hasText(query.getAsnType()),
                        WmsAsn::getAsnType, query.getAsnType())
                .eq(StringUtils.hasText(query.getAsnStatus()),
                        WmsAsn::getAsnStatus, query.getAsnStatus())
                .eq(StringUtils.hasText(query.getSupplierCode()),
                        WmsAsn::getSupplierCode, query.getSupplierCode())
                .eq(StringUtils.hasText(query.getPoNo()),
                        WmsAsn::getPoNo, query.getPoNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(WmsAsn::getAsnNo, query.getKeyword()).or()
                        .like(WmsAsn::getSupplierCode, query.getKeyword()).or()
                        .like(WmsAsn::getSupplierName, query.getKeyword()).or()
                        .like(WmsAsn::getPoNo, query.getKeyword()))
                .orderByDesc(WmsAsn::getId));
        return PageResult.of(page);
    }

    public WmsAsn detail(Long id) {
        return require(id);
    }

    /** 新增或更新收货通知单记录：新增时回填默认 ASN 类型、ASN 状态与组织，收货通知单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, WmsAsnSaveRequest request) {
        WmsAsn entity;
        if (id == null) {
            entity = new WmsAsn();
            entity.setAsnNo(StringUtils.hasText(request.getAsnNo())
                    ? request.getAsnNo() : flowSupport.nextBizNo(DEFAULT_ASN_NO_PREFIX));
            entity.setAsnType(StringUtils.hasText(request.getAsnType())
                    ? request.getAsnType() : DEFAULT_ASN_TYPE);
            entity.setAsnStatus(StringUtils.hasText(request.getAsnStatus())
                    ? request.getAsnStatus() : DEFAULT_ASN_STATUS);
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

    /** 删除收货通知单记录：物理删除以释放收货通知单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public WmsAsn require(Long id) {
        WmsAsn entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "收货通知不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、日期非空、数量非空）时覆盖实体对应字段。 */
    private void applyRequest(WmsAsn entity, WmsAsnSaveRequest request) {
        if (StringUtils.hasText(request.getAsnNo())) {
            entity.setAsnNo(request.getAsnNo());
        }
        if (StringUtils.hasText(request.getAsnType())) {
            entity.setAsnType(request.getAsnType());
        }
        if (StringUtils.hasText(request.getSupplierCode())) {
            entity.setSupplierCode(request.getSupplierCode());
        }
        if (StringUtils.hasText(request.getSupplierName())) {
            entity.setSupplierName(request.getSupplierName());
        }
        if (StringUtils.hasText(request.getPoNo())) {
            entity.setPoNo(request.getPoNo());
        }
        if (request.getExpectedArrivalDate() != null) {
            entity.setExpectedArrivalDate(request.getExpectedArrivalDate());
        }
        if (StringUtils.hasText(request.getCarrier())) {
            entity.setCarrier(request.getCarrier());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            entity.setWarehouseCode(request.getWarehouseCode());
        }
        if (request.getTotalQty() != null) {
            entity.setTotalQty(request.getTotalQty());
        }
        if (request.getReceivedQty() != null) {
            entity.setReceivedQty(request.getReceivedQty());
        }
        if (StringUtils.hasText(request.getAsnStatus())) {
            entity.setAsnStatus(request.getAsnStatus());
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
