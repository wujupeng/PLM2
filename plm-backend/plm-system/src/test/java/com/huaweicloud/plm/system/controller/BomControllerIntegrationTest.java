package com.huaweicloud.plm.system.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:plm2_bom_api_test;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "plm.jwt.secret=plm2-junit-test-secret-0123456789abcdef0123456789"
})
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class BomControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String authorization;

    @BeforeEach
    void login() throws Exception {
        String response = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"admin","password":"admin123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andReturn()
                .getResponse()
                .getContentAsString();
        authorization = "Bearer " + objectMapper.readTree(response).path("data").path("accessToken").asText();
    }

    @Test
    void createsAndReadsBomLineThroughHttpEndpoint() throws Exception {
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        String productCode = "IT-BOM-" + suffix;
        long productId = createProduct(productCode);
        JsonNode product = objectMapper.readTree(mockMvc.perform(get("/product-data/products/{productId}", productId)
                        .header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andReturn()
                .getResponse()
                .getContentAsString(StandardCharsets.UTF_8)).path("data");
        assertEquals("台", product.path("unit").asText());
        long headerId = createBom(productCode, "EBOM");

        String lineResponse = mockMvc.perform(post("/bom/boms/{headerId}/lines", headerId)
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "parentMaterialCode":"%s",
                                  "childMaterialCode":"%s-COMP",
                                  "childMaterialName":"Integration component",
                                  "qty":1.234567,
                                  "unit":"PCS",
                                  "substituteAllowed":0
                                }
                                """.formatted(productCode, productCode)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long lineId = objectMapper.readTree(lineResponse).path("data").asLong();
        assertNotNull(lineId);

        JsonNode detail = objectMapper.readTree(mockMvc.perform(get("/bom/boms/{headerId}", headerId)
                        .header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andReturn()
                .getResponse()
                .getContentAsString()).path("data");
        JsonNode line = detail.path("lines").get(0);
        assertEquals(1, detail.path("lines").size());
        assertEquals(productCode, line.path("parentMaterialCode").asText());
        assertEquals(productCode + "-COMP", line.path("childMaterialCode").asText());
        assertEquals(0, line.path("qty").decimalValue().compareTo(new BigDecimal("1.234567")));
    }

    @Test
    void expandsMultiLevelQuantitiesAndReportsDuplicateAndCircularRelations() throws Exception {
        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        String rootCode = "IT-ROOT-" + suffix;
        String childCode = "IT-CHILD-" + suffix;
        createProduct(rootCode);
        long rootId = createBom(rootCode, "EBOM");
        long childBomId = createBom(childCode, "EBOM");

        addLine(rootId, rootCode, childCode, "2");
        addLine(childBomId, childCode, childCode + "-PART", "3");
        addLine(rootId, rootCode, childCode, "2");

        String expanded = mockMvc.perform(get("/bom/boms/{headerId}/expand", rootId)
                        .header("Authorization", authorization)
                        .param("levels", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode expandedNodes = objectMapper.readTree(expanded).path("data");
        assertEquals(2, expandedNodes.size());
        assertEquals(0, expandedNodes.get(0).path("qty").decimalValue().compareTo(new BigDecimal("2")));
        assertEquals(0, expandedNodes.get(0).path("children").get(0).path("qty")
                .decimalValue().compareTo(new BigDecimal("6")));

        String validation = mockMvc.perform(post("/bom/boms/{headerId}/validate", rootId)
                        .header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode duplicateIssues = objectMapper.readTree(validation).path("data").path("issues");
        boolean hasDuplicate = false;
        for (JsonNode issue : duplicateIssues) {
            hasDuplicate |= "duplicate".equals(issue.path("issueType").asText());
        }
        assertTrue(hasDuplicate, "Expected validation to report duplicate parent/child relations.");

        addLine(childBomId, childCode + "-PART", rootCode, "1");
        String cycleValidation = mockMvc.perform(post("/bom/boms/{headerId}/validate", rootId)
                        .header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode issues = objectMapper.readTree(cycleValidation).path("data").path("issues");
        boolean hasCycle = false;
        for (JsonNode issue : issues) {
            hasCycle |= "cycle".equals(issue.path("issueType").asText())
                    || "cycle".equals(issue.path("issueCode").asText());
        }
        assertTrue(hasCycle, "Expected validation to report the circular BOM relationship.");
    }

    @Test
    void releasesValidatedDraftOnlyThroughPublishAndDoesNotFakeDownstreamAcceptance() throws Exception {
        String productCode = "IT-RELEASE-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        createProduct(productCode);
        long headerId = createBom(productCode, "EBOM");
        long lineId = addLine(headerId, productCode, productCode + "-COMP", "1");

        mockMvc.perform(put("/bom/boms/{headerId}", headerId)
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "productCode":"%s",
                                  "bomType":"EBOM",
                                  "versionNo":"V1",
                                  "status":"released"
                                }
                                """.formatted(productCode, productCode)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));

        String publishResponse = mockMvc.perform(post("/bom/boms/{headerId}/publish", headerId)
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"targetSystems":["ERP"]}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data[0].status").value("pending"))
                .andReturn()
                .getResponse()
                .getContentAsString();
        assertEquals(1, objectMapper.readTree(publishResponse).path("data").size());

        JsonNode detail = objectMapper.readTree(mockMvc.perform(get("/bom/boms/{headerId}", headerId)
                        .header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andReturn()
                .getResponse()
                .getContentAsString()).path("data");
        assertEquals("released", detail.path("header").path("status").asText());

        mockMvc.perform(put("/bom/boms/lines/{lineId}", lineId)
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "parentMaterialCode":"%s",
                                  "childMaterialCode":"%s-COMP",
                                  "qty":2,
                                  "unit":"PCS",
                                  "substituteAllowed":0
                                }
                                """.formatted(productCode, productCode)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(409));
    }

    @Test
    void doesNotReleaseBomWithBlockingValidationIssues() throws Exception {
        String productCode = "IT-INVALID-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        createProduct(productCode);
        long headerId = createBom(productCode, "EBOM");
        addLine(headerId, productCode, productCode + "-COMP", "1");
        addLine(headerId, productCode, productCode + "-COMP", "1");

        mockMvc.perform(post("/bom/boms/{headerId}/publish", headerId)
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"targetSystems":["ERP"]}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));

        JsonNode detail = objectMapper.readTree(mockMvc.perform(get("/bom/boms/{headerId}", headerId)
                        .header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andReturn()
                .getResponse()
                .getContentAsString()).path("data");
        assertEquals("draft", detail.path("header").path("status").asText());
    }

    private long createProduct(String productCode) throws Exception {
        String response = mockMvc.perform(post("/product-data/products")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "productCode":"%s",
                                  "productName":"BOM integration test product",
                                  "unit":"台",
                                  "status":"draft"
                                }
                                """.formatted(productCode)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).path("data").asLong();
    }

    private long createBom(String productCode, String bomType) throws Exception {
        String response = mockMvc.perform(post("/bom/boms")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "productCode":"%s",
                                  "bomType":"%s",
                                  "versionNo":"V1",
                                  "status":"draft"
                                }
                                """.formatted(productCode, bomType)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).path("data").asLong();
    }

    private long addLine(long headerId, String parent, String child, String qty) throws Exception {
        String response = mockMvc.perform(post("/bom/boms/{headerId}/lines", headerId)
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "parentMaterialCode":"%s",
                                  "childMaterialCode":"%s",
                                  "qty":%s,
                                  "unit":"PCS",
                                  "substituteAllowed":0
                                }
                                """.formatted(parent, child, qty)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).path("data").asLong();
    }
}
