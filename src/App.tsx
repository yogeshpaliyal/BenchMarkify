import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { CompareChart } from "./CompareChart";
import { Textarea } from "@/components/ui/textarea";
import { Benchmark } from "./types/benchmark";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BenchmarkTable } from "./BenchmarkTable";
import sampleBenchmarks from "../samplebaseline.json";
import { FiltersSelector } from "./ui/Filters";
import { Filters } from "./types/filters";
import githubLogo from "./assets/github-mark.svg";
import { Button } from "./components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModeToggle } from "./ui/mode-toggle";
import GithubIcon from "./assets/github-mark";

function App() {
  const [benchmarks, setBenchmarks] = useState<Benchmark[] | undefined>([]);
  const [rawInput, setRawInput] = useState<string | undefined>(JSON.stringify(sampleBenchmarks, null, 2));

  const [localBenchmarks, setLocalBenchmarks] = useState<Record<string, string | undefined> | undefined>();

  useEffect(() => {
    const localBenchMarksStr = localStorage.getItem("benchmarks");
    if (localBenchMarksStr) {
      try {
        setLocalBenchmarks(JSON.parse(localBenchMarksStr));
      } catch (e) {
        console.error(e);
      }
    }else{
      setLocalBenchmarks(undefined);
    }
  });
  
function clearBenchMark() {
  localStorage.removeItem("benchmarks") ;
  setBenchmarks([]);
  setLocalBenchmarks(undefined);
}
  useEffect(() => {
    try {
      const value = JSON.parse(rawInput ?? "");
      setFilteredBenchmarks(value.benchmarks);
      setBenchmarks(value.benchmarks);
    } catch (e) {
      setBenchmarks([]);
      console.error(e);
    }
  }, [rawInput]);


  const [filter, setFilter] = useState<Filters | undefined>();

  const [filteredBenchmarks, setFilteredBenchmarks] = useState<
    Benchmark[] | undefined
  >([]);


  useEffect(() => {
    setFilteredBenchmarks(
      benchmarks?.filter((benchmark) =>
        filter?.benchmarkNames.includes(benchmark.name)
      )
    );
  }, [filter]);

  return (
    <div className="flex flex-col h-dvh w-dvw">
      <div className="flex flex-row w-full justify-between p-4">
        <h1 className="text-4xl font-bold text-center ">BenchMarkify 📈</h1>
        <div className="flex flex-wrap sm:space-y-4 md:space-y-0 md:space-x-4 mx-4 justify-end">
        <ModeToggle />
        <a
          className="content-center"
          href="https://github.com/yogeshpaliyal/benchmarkify"
          target="_blank"
        >
          <GithubIcon />
        </a>
        </div>
      </div>
      <div className="md:flex flex-row flex-1 w-full">
        <div className="flex flex-1 flex-col p-4" style={{ flex: 1 }}>
          <div className="w-full flex flex-row space-x-4 pb-4">
            <Select onValueChange={(selectedItem) => setRawInput(localBenchmarks?.[selectedItem])}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Saved Benchmark" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Benchmarks</SelectLabel>
                  {localBenchmarks && Object.keys(localBenchmarks)?.map((localBenchmark) => {
                    return (
                      <SelectItem value={localBenchmark}>
                        {localBenchmark}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="space-x-4">
              <Button
                variant={"ghost"}
                onClick={() => {
                  let value = window.prompt("Save Baseline profile", "");
                  if (value) {
                    const localBenchMarksStr =
                      localStorage.getItem("benchmarks");
                    let localBenchMarks: Record<string, string | undefined> = {};
                    if (localBenchMarksStr) {
                      localBenchMarks = JSON.parse(localBenchMarksStr);
                    }
                    localBenchMarks[value] = rawInput;
                    localStorage.setItem(
                      "benchmarks",
                      JSON.stringify(localBenchMarks, null, 2)
                    );
                    setLocalBenchmarks(localBenchMarks);
                  }
                }}
              >
                Save
              </Button>
              <Button variant={"ghost"} onClick={() => setRawInput("")}>Clear</Button>
              <Button variant={"ghost"} onClick={clearBenchMark}>Clear saved benchmark</Button>
            </div>
          </div>
          <Textarea
            className="flex-1"
            value={rawInput}
            placeholder="Paste Benchmark JSON here"
            onChange={(e) => {
              setRawInput(e.currentTarget.value);
            }}
          />
        </div>
        <div
          className="flex flex-1 justify-around content-around p-8"
          style={{ flex: 2 }}
        >
          <div className="w-full">
            <FiltersSelector
              benchmarks={benchmarks}
              filters={filter}
              setFilters={setFilter}
            />

            <Tabs defaultValue="charts" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="charts">Charts</TabsTrigger>
                <TabsTrigger value="table">Table</TabsTrigger>
              </TabsList>
              <TabsContent value="charts">
                <CompareChart filter={filter} benchmarks={filteredBenchmarks} />
              </TabsContent>
              <TabsContent value="table">
                <BenchmarkTable benchmarks={filteredBenchmarks} filters={filter}/>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <div className="text-center p-4 text-xs"> Created By <a href="https://github.com/yogeshpaliyal" target="_blank">Yogesh Paliyal</a> </div>
    </div>
  );
}

export default App;
