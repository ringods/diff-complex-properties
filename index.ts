import * as compute from "@pulumi/azure-native/compute";
import * as network from "@pulumi/azure-native/network";
import * as resources from "@pulumi/azure-native/resources";
import * as azure_classic from "@pulumi/azure";

// Create an Azure Resource Group
const resourceGroup = new resources.ResourceGroup("diff-complex-properties", {
    location: "westeurope"
});

// Create a virtual network
const vnet = new azure_classic.network.VirtualNetwork("vmtest01", {
    addressSpaces: ["10.1.0.0/16"],
    location: resourceGroup.location,
    resourceGroupName: resourceGroup.name,
});

// Create a subnet
const subnet = new network.Subnet("snet1", {
    resourceGroupName: resourceGroup.name,
    virtualNetworkName: vnet.name,
    addressPrefix: "10.1.0.0/24",
    subnetName: "default",
    type: "Microsoft.Network/virtualNetworks/subnets",
    privateEndpointNetworkPolicies: "Disabled",
    privateLinkServiceNetworkPolicies: "Enabled"
});

// Create a NIC resource
const networkInterface = new network.NetworkInterface("nic1", {
    enableAcceleratedNetworking: true,
    ipConfigurations: [{
        name: "ipconfig1",
        privateIPAllocationMethod: "Dynamic",
        subnet: {
            id: subnet.id,
        },
    }],
    location: resourceGroup.location,
    networkInterfaceName: "vmtest792",
    resourceGroupName: resourceGroup.name,
});

// Create a disk resource
const disk = new compute.Disk("dataDisk1", {
    diskName: "dataDisk1",
    diskSizeGB: 1024,
    location: resourceGroup.location,
    resourceGroupName: resourceGroup.name,
    sku: {
        name: "Premium_LRS"
    },
    creationData: {
        createOption: "Empty",
    },
    burstingEnabled: true,
    diskIOPSReadWrite: 5000,
    diskMBpsReadWrite: 200,
    encryption: {
    type: "EncryptionAtRestWithPlatformKey"
    },
    networkAccessPolicy: "AllowAll",
    tier: "P30",
    zones: [],
});

// Creating VM resource
const virtualMachine = new compute.VirtualMachine("smc1", {

    diagnosticsProfile: {
        bootDiagnostics: {
            enabled: true,
        },
    },

    hardwareProfile: {
        vmSize: "Standard_D2s_v3",
    },

    identity: {
        type: compute.ResourceIdentityType.SystemAssigned,
    },

    location: resourceGroup.location,

    networkProfile: {
        networkInterfaces: [{
            id: networkInterface.id,
            primary: true,
        }],
    },

    osProfile: {
        adminUsername: "azureuser",
        adminPassword: "Test20202023!!",
        allowExtensionOperations: true,
        computerName: "vmtest",
    },

    resourceGroupName: resourceGroup.name,

    storageProfile: {
        imageReference: {
            offer: "WindowsServer",
            publisher: "MicrosoftWindowsServer",
            sku: "2022-datacenter-azure-edition",
            version: "latest",
        },
        osDisk: {
            caching: "ReadWrite",
            createOption: "FromImage",
            diskSizeGB: 127,
            managedDisk: {
                storageAccountType: "Premium_LRS",
            },
            name: "vmtest01_disk1_c8e15753641c458584260f6ba3fa57ef",
            osType: compute.OperatingSystemTypes.Windows,
        },
        dataDisks: [
            {
              createOption: "Attach",
              lun:0,
              managedDisk: {
                id: disk.id
              }
            },
          ],
    },

    vmName: "vmtest",

    zones: []
});
