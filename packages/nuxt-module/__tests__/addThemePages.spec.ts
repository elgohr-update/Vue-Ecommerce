import { addThemePages } from "../src/pages";
import * as files from "../src/files";
import { NuxtModuleOptions } from "../src/interfaces";

jest.mock("../src/files");
const mockedFiles = files as jest.Mocked<typeof files>;
const { getAllFiles } = mockedFiles;

describe("nuxt-module - addThemePages", () => {
  let rootRoutes: any = [];
  let methods: Function[] = [];
  const moduleObject: NuxtModuleOptions = {
    options: {
      rootDir: __dirname
    },
    addLayout: jest.fn(),
    addPlugin: jest.fn(),
    extendBuild: jest.fn(),
    nuxt: jest.fn(),
    extendRoutes: (method: Function): void => {
      methods.push(method);
    }
  };
  /**
   * To resolve extendRoutes we need to invoke resolveRoutes after method
   * invocation to test real impact on rootRoutes configuration
   */
  const resolveRoutes = () => methods.forEach(method => method(rootRoutes));

  beforeEach(() => {
    jest.resetAllMocks();
    rootRoutes = [];
    methods = [];
  });

  it("should override Nuxt created routes", () => {
    rootRoutes = [
      {
        chunkName: "pages/FakeCreatedRoute",
        component: `${__dirname}/pages/FakeCreatedRoute.vue`,
        name: "FakeCreatedRoute",
        path: "/FakeCreatedRoute"
      }
    ];
    getAllFiles
      .mockImplementationOnce(() => [])
      .mockImplementationOnce(() => [`${__dirname}/pages/Test.vue`]);
    addThemePages(moduleObject);
    resolveRoutes();
    expect(getAllFiles).toBeCalledTimes(2);
    expect(getAllFiles).toBeCalledWith(
      `${moduleObject.options.rootDir}/node_modules/@shopware-pwa/default-theme/pages`
    );
    expect(getAllFiles).toBeCalledWith(`${moduleObject.options.rootDir}/pages`);
    expect(rootRoutes).toEqual([
      {
        chunkName: "pages/Test",
        component: `${__dirname}/pages/Test.vue`,
        name: "Test",
        path: "/Test"
      }
    ]);
  });

  it("should call getAllFiles twice", () => {
    getAllFiles
      .mockImplementationOnce(() => [])
      .mockImplementationOnce(() => []);
    addThemePages(moduleObject);
    expect(getAllFiles).toBeCalledTimes(2);
    expect(getAllFiles).toBeCalledWith(
      `${moduleObject.options.rootDir}/node_modules/@shopware-pwa/default-theme/pages`
    );
    expect(getAllFiles).toBeCalledWith(`${moduleObject.options.rootDir}/pages`);
  });
  it("should not change user project routes", () => {
    getAllFiles
      .mockImplementationOnce(() => [])
      .mockImplementationOnce(() => [`${__dirname}/pages/Test.vue`]);
    addThemePages(moduleObject);
    resolveRoutes();

    expect(getAllFiles).toBeCalledWith(`${moduleObject.options.rootDir}/pages`);
    expect(rootRoutes).toEqual([
      {
        chunkName: "pages/Test",
        component: `${__dirname}/pages/Test.vue`,
        name: "Test",
        path: "/Test"
      }
    ]);
  });

  it("should merge routes from theme and project", () => {
    getAllFiles
      .mockImplementationOnce(() => [
        `${__dirname}/node_modules/@shopware-pwa/default-theme/pages/SomeTest.vue`
      ])
      .mockImplementationOnce(() => [`${__dirname}/pages/Test.vue`]);
    addThemePages(moduleObject);
    resolveRoutes();

    expect(getAllFiles).toBeCalledWith(`${moduleObject.options.rootDir}/pages`);
    expect(rootRoutes).toEqual([
      {
        chunkName: "pages/SomeTest",
        component: `${__dirname}/node_modules/@shopware-pwa/default-theme/pages/SomeTest.vue`,
        name: "SomeTest",
        path: "/SomeTest"
      },
      {
        chunkName: "pages/Test",
        component: `${__dirname}/pages/Test.vue`,
        name: "Test",
        path: "/Test"
      }
    ]);
  });

  it("should override routes from theme by routes from project directory", () => {
    getAllFiles
      .mockImplementationOnce(() => [
        `${__dirname}/node_modules/@shopware-pwa/default-theme/pages/Test.vue`
      ])
      .mockImplementationOnce(() => [`${__dirname}/pages/Test.vue`]);
    addThemePages(moduleObject);
    resolveRoutes();

    expect(getAllFiles).toBeCalledWith(`${moduleObject.options.rootDir}/pages`);
    expect(rootRoutes).toEqual([
      {
        chunkName: "pages/Test",
        component: `${__dirname}/pages/Test.vue`,
        name: "Test",
        path: "/Test"
      }
    ]);
  });
});
