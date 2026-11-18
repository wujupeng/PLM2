package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpSalesForecastQuery;
import com.huaweicloud.plm.system.dto.ErpSalesForecastSaveRequest;
import com.huaweicloud.plm.system.entity.ErpSalesForecast;
import com.huaweicloud.plm.system.mapper.ErpSalesForecastMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 销售管理—销售预测（G3-N2 ERP 销售管理）：
 * 销售预测登记、分页查询与删除。
 * 预测单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpSalesForecastService {

    private static final String DEFAULT_FORECAST_NO_PREFIX = "SFOR";
    private static final String DEFAULT_FORECAST_TYPE = "MONTHLY";
    private static final String DEFAULT_FORECAST_STATUS = "OPEN";

    private final ErpSalesForecastMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询销售预测：状态/类型/客户编码/物料编码精确，单号/物料编码/客户名称模糊，按主键倒序。 */
    public PageResult<ErpSalesForecast> pageForecasts(ErpSalesForecastQuery query) {
        Page<ErpSalesForecast> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpSalesForecast>lambdaQuery()
                .eq(StringUtils.hasText(query.getForecastStatus()),
                        ErpSalesForecast::getForecastStatus, query.getForecastStatus())
                .eq(StringUtils.hasText(query.getForecastType()),
                        ErpSalesForecast::getForecastType, query.getForecastType())
                .eq(StringUtils.hasText(query.getCustomerCode()),
                        ErpSalesForecast::getCustomerCode, query.getCustomerCode())
                .eq(StringUtils.hasText(query.getMaterialCode()),
                        ErpSalesForecast::getMaterialCode, query.getMaterialCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpSalesForecast::getForecastNo, query.getKeyword()).or()
                        .like(ErpSalesForecast::getMaterialCode, query.getKeyword()).or()
                        .like(ErpSalesForecast::getCustomerName, query.getKeyword()))
                .orderByDesc(ErpSalesForecast::getId));
        return PageResult.of(page);
    }

    public ErpSalesForecast detail(Long id) {
        return require(id);
    }

    /** 新增或更新销售预测：新增时回填默认预测数量/类型/状态与组织，预测单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpSalesForecastSaveRequest request) {
        ErpSalesForecast entity;
        if (id == null) {
            entity = new ErpSalesForecast();
            entity.setForecastNo(StringUtils.hasText(request.getForecastNo())
                    ? request.getForecastNo() : flowSupport.nextBizNo(DEFAULT_FORECAST_NO_PREFIX));
            entity.setForecastQty(request.getForecastQty() != null
                    ? request.getForecastQty() : BigDecimal.ZERO);
            entity.setForecastType(StringUtils.hasText(request.getForecastType())
                    ? request.getForecastType() : DEFAULT_FORECAST_TYPE);
            entity.setForecastStatus(StringUtils.hasText(request.getForecastStatus())
                    ? request.getForecastStatus() : DEFAULT_FORECAST_STATUS);
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

    /** 删除销售预测：物理删除以释放预测单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpSalesForecast require(Long id) {
        ErpSalesForecast entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "销售预测不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpSalesForecast entity, ErpSalesForecastSaveRequest request) {
        if (StringUtils.hasText(request.getForecastNo())) {
            entity.setForecastNo(request.getForecastNo());
        }
        if (StringUtils.hasText(request.getCustomerCode())) {
            entity.setCustomerCode(request.getCustomerCode());
        }
        if (StringUtils.hasText(request.getCustomerName())) {
            entity.setCustomerName(request.getCustomerName());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getSpec())) {
            entity.setSpec(request.getSpec());
        }
        if (StringUtils.hasText(request.getForecastPeriod())) {
            entity.setForecastPeriod(request.getForecastPeriod());
        }
        if (request.getForecastDate() != null) {
            entity.setForecastDate(request.getForecastDate());
        }
        if (request.getForecastQty() != null) {
            entity.setForecastQty(request.getForecastQty());
        }
        if (StringUtils.hasText(request.getForecastType())) {
            entity.setForecastType(request.getForecastType());
        }
        if (StringUtils.hasText(request.getForecastStatus())) {
            entity.setForecastStatus(request.getForecastStatus());
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
