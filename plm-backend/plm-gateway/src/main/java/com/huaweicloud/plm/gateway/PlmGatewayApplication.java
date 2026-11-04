package com.huaweicloud.plm.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class PlmGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(PlmGatewayApplication.class, args);
    }
}