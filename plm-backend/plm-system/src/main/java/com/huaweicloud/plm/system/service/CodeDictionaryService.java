package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.CodeDictionaryQuery;
import com.huaweicloud.plm.system.dto.CodeDictionarySaveRequest;
import com.huaweicloud.plm.system.entity.CodeDictionary;
import com.huaweicloud.plm.system.mapper.CodeDictionaryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 统一码表服务（DEV-053）。
 */
@Service
@RequiredArgsConstructor
public class CodeDictionaryService {

    private final CodeDictionaryMapper codeDictionaryMapper;

    public PageResult<CodeDictionary> page(CodeDictionaryQuery query) {
        Page<CodeDictionary> page = query.toPage();
        codeDictionaryMapper.selectPage(page, Wrappers.<CodeDictionary>lambdaQuery()
                .eq(StringUtils.hasText(query.getDictType()), CodeDictionary::getDictType, query.getDictType())
                .eq(query.getStatus() != null, CodeDictionary::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(CodeDictionary::getDictCode, query.getKeyword()).or()
                        .like(CodeDictionary::getDictName, query.getKeyword()))
                .orderByAsc(CodeDictionary::getDictType)
                .orderByAsc(CodeDictionary::getSortNo)
                .orderByAsc(CodeDictionary::getDictCode));
        return PageResult.of(page);
    }

    public List<CodeDictionary> listByType(String dictType) {
        return codeDictionaryMapper.selectList(Wrappers.<CodeDictionary>lambdaQuery()
                .eq(CodeDictionary::getDictType, dictType)
                .eq(CodeDictionary::getStatus, 1)
                .orderByAsc(CodeDictionary::getSortNo)
                .orderByAsc(CodeDictionary::getDictCode));
    }

    public List<String> listTypes() {
        return codeDictionaryMapper.listTypes();
    }

    public Long create(CodeDictionarySaveRequest request) {
        ensureUnique(request.getDictType(), request.getDictCode(), -1L);
        CodeDictionary dictionary = new CodeDictionary();
        applyRequest(dictionary, request);
        codeDictionaryMapper.insert(dictionary);
        return dictionary.getId();
    }

    public void update(Long dictId, CodeDictionarySaveRequest request) {
        CodeDictionary dictionary = requireDictionary(dictId);
        ensureUnique(request.getDictType(), request.getDictCode(), dictId);
        applyRequest(dictionary, request);
        codeDictionaryMapper.updateById(dictionary);
    }

    public void delete(Long dictId) {
        requireDictionary(dictId);
        codeDictionaryMapper.deleteById(dictId);
    }

    public String resolveName(String dictType, String dictCode) {
        CodeDictionary dictionary = codeDictionaryMapper.selectOne(Wrappers.<CodeDictionary>lambdaQuery()
                .eq(CodeDictionary::getDictType, dictType)
                .eq(CodeDictionary::getDictCode, dictCode));
        return dictionary == null ? null : dictionary.getDictName();
    }

    public boolean exists(String dictType, String dictCode) {
        return codeDictionaryMapper.selectCount(Wrappers.<CodeDictionary>lambdaQuery()
                .eq(CodeDictionary::getDictType, dictType)
                .eq(CodeDictionary::getDictCode, dictCode)) > 0;
    }

    private void applyRequest(CodeDictionary dictionary, CodeDictionarySaveRequest request) {
        dictionary.setDictType(request.getDictType());
        dictionary.setDictCode(request.getDictCode());
        dictionary.setDictName(request.getDictName());
        dictionary.setExtValue(request.getExtValue());
        dictionary.setExtText(request.getExtText());
        dictionary.setSortNo(request.getSortNo() == null ? 0 : request.getSortNo());
        dictionary.setStatus(request.getStatus() == null ? 1 : request.getStatus());
        dictionary.setRemark(request.getRemark());
    }

    private void ensureUnique(String dictType, String dictCode, Long excludeId) {
        if (codeDictionaryMapper.countByCode(dictType, dictCode, excludeId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "码表已存在该取值: " + dictType + "/" + dictCode);
        }
    }

    public CodeDictionary requireDictionary(Long dictId) {
        CodeDictionary dictionary = codeDictionaryMapper.selectById(dictId);
        if (dictionary == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "码表项不存在: " + dictId);
        }
        return dictionary;
    }
}
