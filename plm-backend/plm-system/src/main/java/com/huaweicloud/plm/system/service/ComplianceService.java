package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.SpecComplianceCheckResult;
import com.huaweicloud.plm.system.dto.SpecComplianceQuery;
import com.huaweicloud.plm.system.dto.SpecComplianceSaveRequest;
import com.huaweicloud.plm.system.entity.SpecCompliance;
import com.huaweicloud.plm.system.mapper.SpecComplianceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 环保合规服务（DEV-045）。
 */
@Service
@RequiredArgsConstructor
public class ComplianceService {

    private static final String CONFIG_REQUIRED_TYPES = "compliance.required_types";
    private static final String CONFIG_EXPIRE_WARN_DAYS = "compliance.expire.warn_days";
    private static final String CONFIG_BLOCK_RELEASE = "compliance.block_release";

    private static final List<String> DEFAULT_REQUIRED_TYPES = List.of("rohs", "reach");
    private static final int DEFAULT_WARN_DAYS = 30;

    private static final String DEFAULT_STATUS = "pending";
    private static final String STATUS_VALID = "valid";
    private static final String STATUS_EXPIRED = "expired";
    private static final String STATUS_MISSING = "missing";
    private static final String STATUS_PENDING = "pending";

    private final SpecComplianceMapper complianceMapper;
    private final ConfigService configService;

    public PageResult<SpecCompliance> page(SpecComplianceQuery query) {
        Page<SpecCompliance> page = query.toPage();
        complianceMapper.selectPage(page, Wrappers.<SpecCompliance>lambdaQuery()
                .eq(StringUtils.hasText(query.getComplianceCode()),
                        SpecCompliance::getComplianceCode, query.getComplianceCode())
                .eq(StringUtils.hasText(query.getMaterialCode()), SpecCompliance::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getRequirementType()),
                        SpecCompliance::getRequirementType, query.getRequirementType())
                .eq(StringUtils.hasText(query.getRiskLevel()), SpecCompliance::getRiskLevel, query.getRiskLevel())
                .eq(StringUtils.hasText(query.getStatus()), SpecCompliance::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SpecCompliance::getComplianceCode, query.getKeyword()).or()
                        .like(SpecCompliance::getMaterialCode, query.getKeyword()).or()
                        .like(SpecCompliance::getMaterialName, query.getKeyword()))
                .orderByDesc(SpecCompliance::getCreatedAt));
        return PageResult.of(page);
    }

    public SpecCompliance getById(Long complianceId) {
        return requireCompliance(complianceId);
    }

    public List<SpecCompliance> listByMaterial(String materialCode) {
        return complianceMapper.selectList(Wrappers.<SpecCompliance>lambdaQuery()
                .eq(SpecCompliance::getMaterialCode, materialCode)
                .orderByAsc(SpecCompliance::getId));
    }

    /** 即将到期清单：失效日期在 [今天, 今天 + 预警天数] 且状态为有效的记录。 */
    public List<SpecCompliance> listExpiring(Integer days) {
        int warnDays = days == null || days < 0 ? resolveWarnDays() : days;
        LocalDate today = LocalDate.now();
        LocalDate limit = today.plusDays(warnDays);
        return complianceMapper.selectList(Wrappers.<SpecCompliance>lambdaQuery()
                .ge(SpecCompliance::getExpireDate, today)
                .le(SpecCompliance::getExpireDate, limit)
                .in(SpecCompliance::getStatus, List.of(STATUS_VALID, STATUS_PENDING))
                .orderByAsc(SpecCompliance::getExpireDate));
    }

    @Transactional
    public Long create(SpecComplianceSaveRequest request) {
        if (complianceMapper.countByCode(request.getComplianceCode(), -1L) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "合规记录编码已存在: " + request.getComplianceCode());
        }
        SpecCompliance compliance = new SpecCompliance();
        applyRequest(compliance, request);
        complianceMapper.insert(compliance);
        return compliance.getId();
    }

    @Transactional
    public void update(Long complianceId, SpecComplianceSaveRequest request) {
        SpecCompliance compliance = requireCompliance(complianceId);
        if (!compliance.getComplianceCode().equals(request.getComplianceCode())
                && complianceMapper.countByCode(request.getComplianceCode(), complianceId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "合规记录编码已存在: " + request.getComplianceCode());
        }
        applyRequest(compliance, request);
        complianceMapper.updateById(compliance);
    }

    @Transactional
    public void delete(Long complianceId) {
        requireCompliance(complianceId);
        complianceMapper.deleteById(complianceId);
    }

    /** 单条合规检查：按声明编号与有效期实际情况刷新状态并记录校验时间。 */
    @Transactional
    public SpecCompliance check(Long complianceId) {
        SpecCompliance compliance = requireCompliance(complianceId);
        compliance.setStatus(resolveStatus(compliance));
        compliance.setCheckedAt(LocalDateTime.now());
        complianceMapper.updateById(compliance);
        return compliance;
    }

    /** 物料合规校验：逐个强制类型检查是否存在未过期且已声明资料的记录。 */
    public SpecComplianceCheckResult checkMaterial(String materialCode) {
        List<String> requiredTypes = resolveRequiredTypes();
        List<SpecCompliance> records = StringUtils.hasText(materialCode)
                ? listByMaterial(materialCode)
                : List.of();

        LocalDate today = LocalDate.now();
        List<String> missingTypes = new ArrayList<>();
        List<String> expiredTypes = new ArrayList<>();
        for (String type : requiredTypes) {
            boolean declared = false;
            boolean expired = false;
            for (SpecCompliance record : records) {
                if (!type.equalsIgnoreCase(trimToEmpty(record.getRequirementType()))) {
                    continue;
                }
                if (!StringUtils.hasText(record.getDeclarationNo())) {
                    continue;
                }
                declared = true;
                if (record.getExpireDate() != null && record.getExpireDate().isBefore(today)) {
                    expired = true;
                } else {
                    expired = false;
                    break;
                }
            }
            if (!declared) {
                missingTypes.add(type);
            } else if (expired) {
                expiredTypes.add(type);
            }
        }

        SpecComplianceCheckResult result = new SpecComplianceCheckResult();
        result.setMissingTypes(missingTypes);
        result.setExpiredTypes(expiredTypes);
        result.setPassed(missingTypes.isEmpty() && expiredTypes.isEmpty());
        result.setMessage(buildMessage(result, resolveBlockRelease()));
        return result;
    }

    private String buildMessage(SpecComplianceCheckResult result, boolean blockRelease) {
        String policy = blockRelease ? "缺少强制合规资料将阻断发布" : "缺少强制合规资料仅预警";
        if (result.isPassed()) {
            return "物料合规校验通过；" + policy;
        }
        List<String> problems = new ArrayList<>();
        if (!result.getMissingTypes().isEmpty()) {
            problems.add("缺少合规资料类型: " + String.join(",", result.getMissingTypes()));
        }
        if (!result.getExpiredTypes().isEmpty()) {
            problems.add("合规资料已过期类型: " + String.join(",", result.getExpiredTypes()));
        }
        return "物料合规校验未通过，" + String.join("；", problems) + "；" + policy;
    }

    private String resolveStatus(SpecCompliance compliance) {
        if (!StringUtils.hasText(compliance.getDeclarationNo())) {
            return STATUS_MISSING;
        }
        LocalDate expireDate = compliance.getExpireDate();
        if (expireDate == null) {
            return STATUS_PENDING;
        }
        return expireDate.isBefore(LocalDate.now()) ? STATUS_EXPIRED : STATUS_VALID;
    }

    private List<String> resolveRequiredTypes() {
        String value = configService.getValue(CONFIG_REQUIRED_TYPES);
        List<String> types = new ArrayList<>();
        if (StringUtils.hasText(value)) {
            for (String item : Arrays.asList(value.split(","))) {
                if (StringUtils.hasText(item)) {
                    types.add(item.trim().toLowerCase());
                }
            }
        }
        return types.isEmpty() ? DEFAULT_REQUIRED_TYPES : types;
    }

    private int resolveWarnDays() {
        String value = configService.getValue(CONFIG_EXPIRE_WARN_DAYS);
        if (StringUtils.hasText(value)) {
            try {
                return Integer.parseInt(value.trim());
            } catch (NumberFormatException ignored) {
                return DEFAULT_WARN_DAYS;
            }
        }
        return DEFAULT_WARN_DAYS;
    }

    private boolean resolveBlockRelease() {
        String value = configService.getValue(CONFIG_BLOCK_RELEASE);
        return !StringUtils.hasText(value) || Boolean.parseBoolean(value.trim());
    }

    private String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private void applyRequest(SpecCompliance compliance, SpecComplianceSaveRequest request) {
        compliance.setComplianceCode(request.getComplianceCode());
        compliance.setMaterialCode(request.getMaterialCode());
        compliance.setMaterialName(request.getMaterialName());
        compliance.setRequirementType(request.getRequirementType());
        compliance.setRiskLevel(request.getRiskLevel());
        compliance.setSupplierCode(request.getSupplierCode());
        compliance.setDeclarationNo(request.getDeclarationNo());
        compliance.setDeclarationFile(request.getDeclarationFile());
        compliance.setEffectiveDate(request.getEffectiveDate());
        compliance.setExpireDate(request.getExpireDate());
        compliance.setStatus(StringUtils.hasText(request.getStatus())
                ? request.getStatus()
                : (compliance.getStatus() == null ? DEFAULT_STATUS : compliance.getStatus()));
        compliance.setRemark(request.getRemark());
    }

    private SpecCompliance requireCompliance(Long complianceId) {
        SpecCompliance compliance = complianceMapper.selectById(complianceId);
        if (compliance == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "环保合规记录不存在: " + complianceId);
        }
        return compliance;
    }
}
